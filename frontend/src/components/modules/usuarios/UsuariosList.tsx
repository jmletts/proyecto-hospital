import React, { useEffect, useState } from 'react';
import { apiService } from '../../../services/api.service';
import { DataTable, type Column } from '../../ui/DataTable';
import { Modal } from '../../ui/Modal';
import { ConfirmDialog } from '../../ui/ConfirmDialog';

interface Role {
  id_rol: number;
  nombre: string;
}

interface Usuario {
  id_usuario: number;
  id_rol: number;
  correo: string;
  estado: boolean;
  rol: Role;
}

export const UsuariosList: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [idRol, setIdRol] = useState<number | ''>('');
  const [estado, setEstado] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [usuarioToDelete, setUsuarioToDelete] = useState<Usuario | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, rolesData] = await Promise.all([
        apiService.getAll<Usuario>('usuarios'),
        apiService.getAll<Role>('roles'),
      ]);
      setUsuarios(usersData);
      setRoles(rolesData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingUsuario(null);
    setCorreo('');
    setPassword('');
    setIdRol(roles.length > 0 ? roles[0].id_rol : '');
    setEstado(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (user: Usuario) => {
    setEditingUsuario(user);
    setCorreo(user.correo);
    setPassword(''); // No mostrar la contraseña por seguridad
    setIdRol(user.id_rol);
    setEstado(user.estado);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idRol) return alert('Por favor, seleccione un rol.');

    setSubmitting(true);
    try {
      const payload: any = {
        correo,
        id_rol: Number(idRol),
        estado,
      };

      // Solo enviar contraseña si se rellenó o si es un registro nuevo
      if (password) {
        payload.password = password;
      } else if (!editingUsuario) {
        throw new Error('La contraseña es requerida para nuevos usuarios.');
      }

      if (editingUsuario) {
        await apiService.update<Usuario>('usuarios', editingUsuario.id_usuario, payload);
      } else {
        await apiService.create<Usuario>('usuarios', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al guardar el usuario.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (user: Usuario) => {
    setUsuarioToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!usuarioToDelete) return;
    setDeleting(true);
    try {
      await apiService.delete('usuarios', usuarioToDelete.id_usuario);
      setDeleteDialogOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el usuario.');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<Usuario>[] = [
    { key: 'id_usuario', label: 'ID' },
    { key: 'correo', label: 'Correo' },
    { 
      key: 'id_rol', 
      label: 'Rol',
      render: (item) => item.rol?.nombre || 'Sin Rol'
    },
    { 
      key: 'estado', 
      label: 'Estado',
      render: (item) => (
        <span className={`badge ${item.estado ? 'badge-success' : 'badge-danger'}`}>
          {item.estado ? 'Activo' : 'Inactivo'}
        </span>
      )
    },
  ];

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h1 className="module-title">Usuarios</h1>
          <p className="module-subtitle">Cuentas y credenciales de acceso para el personal.</p>
        </div>
        <button className="btn btn-primary btn-add" onClick={handleOpenCreate}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '8px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Crear Usuario
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <DataTable
        columns={columns}
        data={usuarios}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingUsuario ? 'Editar Usuario' : 'Crear Usuario'}
      >
        <form onSubmit={handleSave} className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="correo">Correo Electrónico</label>
            <input
              id="correo"
              type="email"
              className="form-input"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
              placeholder="ejemplo@nawi.com"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Contraseña {editingUsuario && '(dejar en blanco para conservar)'}
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={!editingUsuario}
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="idRol">Rol</label>
            <select
              id="idRol"
              className="form-input"
              value={idRol}
              onChange={(e) => setIdRol(e.target.value ? Number(e.target.value) : '')}
              required
            >
              <option value="">Seleccione un rol...</option>
              {roles.map((rol) => (
                <option key={rol.id_rol} value={rol.id_rol}>
                  {rol.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              id="estado"
              type="checkbox"
              checked={estado}
              onChange={(e) => setEstado(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label className="form-label" htmlFor="estado" style={{ margin: 0, cursor: 'pointer' }}>
              Usuario Activo
            </label>
          </div>

          <div className="form-actions-modal">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Usuario"
        message={`¿Está seguro de que desea eliminar el usuario "${usuarioToDelete?.correo}"? Todos los registros vinculados se verán afectados.`}
        loading={deleting}
      />
    </div>
  );
};

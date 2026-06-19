import React, { useEffect, useState } from 'react';
import { apiService } from '../../../services/api.service';
import { DataTable, type Column } from '../../ui/DataTable';
import { Modal } from '../../ui/Modal';
import { ConfirmDialog } from '../../ui/ConfirmDialog';

interface Role {
  id_rol: number;
  nombre: string;
  descripcion: string | null;
}

export const RolesList: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form & Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAll<Role>('roles');
      setRoles(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los roles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenCreate = () => {
    setEditingRole(null);
    setNombre('');
    setDescripcion('');
    setModalOpen(true);
  };

  const handleOpenEdit = (role: Role) => {
    setEditingRole(role);
    setNombre(role.nombre);
    setDescripcion(role.descripcion || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { nombre, descripcion: descripcion || null };
      if (editingRole) {
        await apiService.update<Role>('roles', editingRole.id_rol, payload);
      } else {
        await apiService.create<Role>('roles', payload);
      }
      setModalOpen(false);
      fetchRoles();
    } catch (err: any) {
      alert(err.message || 'Error al guardar el rol.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (role: Role) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;
    setDeleting(true);
    try {
      await apiService.delete('roles', roleToDelete.id_rol);
      setDeleteDialogOpen(false);
      fetchRoles();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el rol.');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<Role>[] = [
    { key: 'id_rol', label: 'ID' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'descripcion', label: 'Descripción' },
  ];

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h1 className="module-title">Roles de Usuario</h1>
          <p className="module-subtitle">Administra los roles y permisos del sistema.</p>
        </div>
        <button className="btn btn-primary btn-add" onClick={handleOpenCreate}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '8px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Crear Rol
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <DataTable
        columns={columns}
        data={roles}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRole ? 'Editar Rol' : 'Crear Rol'}
      >
        <form onSubmit={handleSave} className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="nombre">Nombre del Rol</label>
            <input
              id="nombre"
              type="text"
              className="form-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Ej: Administrador, Médico"
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              className="form-input"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Describa las responsabilidades del rol..."
              style={{ minHeight: '100px', resize: 'vertical' }}
            />
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
        title="Eliminar Rol"
        message={`¿Está seguro de que desea eliminar el rol "${roleToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        loading={deleting}
      />
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { apiService } from '../../../services/api.service';
import { DataTable, type Column } from '../../ui/DataTable';
import { Modal } from '../../ui/Modal';
import { ConfirmDialog } from '../../ui/ConfirmDialog';

interface Usuario {
  id_usuario: number;
  correo: string;
}

interface Medico {
  id_medico: number;
  id_usuario: number;
  nombres: string;
  apellidos: string;
  cmp: string;
  especialidad: string;
  usuario: Usuario;
}

export const MedicosList: React.FC = () => {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMedico, setEditingMedico] = useState<Medico | null>(null);
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [cmp, setCmp] = useState('');
  const [especialidad, setEspecialidad] = useState('Oftalmología General');
  const [idUsuario, setIdUsuario] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [medicoToDelete, setMedicoToDelete] = useState<Medico | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const medData = await apiService.getAll<Medico>('medicos');
      setMedicos(medData);
      
      try {
        const userData = await apiService.getAll<Usuario>('usuarios');
        setUsuarios(userData);
      } catch (err: any) {
        console.warn('No se pudieron cargar los usuarios (probablemente por falta de permisos):', err);
        setUsuarios([]);
      }
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
    setEditingMedico(null);
    setNombres('');
    setApellidos('');
    setCmp('');
    setEspecialidad('Oftalmología General');
    setIdUsuario('');
    setModalOpen(true);
  };

  const handleOpenEdit = (medico: Medico) => {
    setEditingMedico(medico);
    setNombres(medico.nombres);
    setApellidos(medico.apellidos);
    setCmp(medico.cmp);
    setEspecialidad(medico.especialidad);
    setIdUsuario(medico.id_usuario);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idUsuario) return alert('Por favor, vincule el médico a una cuenta de usuario.');

    setSubmitting(true);
    try {
      const payload = {
        nombres,
        apellidos,
        cmp,
        especialidad,
        id_usuario: Number(idUsuario),
      };

      if (editingMedico) {
        await apiService.update<Medico>('medicos', editingMedico.id_medico, payload);
      } else {
        await apiService.create<Medico>('medicos', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al guardar el médico.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (medico: Medico) => {
    setMedicoToDelete(medico);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!medicoToDelete) return;
    setDeleting(true);
    try {
      await apiService.delete('medicos', medicoToDelete.id_medico);
      setDeleteDialogOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el médico.');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<Medico>[] = [
    { key: 'cmp', label: 'CMP (Colegiatura)' },
    { 
      key: 'medico', 
      label: 'Médico',
      render: (item) => `${item.nombres} ${item.apellidos}`
    },
    { key: 'especialidad', label: 'Especialidad' },
    { 
      key: 'id_usuario', 
      label: 'Cuenta Usuario',
      render: (item) => item.usuario?.correo || '-'
    },
  ];

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h1 className="module-title">Médicos</h1>
          <p className="module-subtitle">Personal médico y especialistas registrados en el sistema.</p>
        </div>
        <button className="btn btn-primary btn-add" onClick={handleOpenCreate}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '8px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Registrar Médico
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <DataTable
        columns={columns}
        data={medicos}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingMedico ? 'Editar Médico' : 'Registrar Médico'}
      >
        <form onSubmit={handleSave} className="modal-form">
          <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="cmp">CMP (Código de Colegiatura)</label>
              <input
                id="cmp"
                type="text"
                className="form-input"
                value={cmp}
                onChange={(e) => setCmp(e.target.value)}
                required
                placeholder="Código CMP"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="especialidad">Especialidad</label>
              <input
                id="especialidad"
                type="text"
                className="form-input"
                value={especialidad}
                onChange={(e) => setEspecialidad(e.target.value)}
                required
                placeholder="Ej: Oftalmología Pediátrica"
              />
            </div>
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="nombres">Nombres</label>
              <input
                id="nombres"
                type="text"
                className="form-input"
                value={nombres}
                onChange={(e) => setNombres(e.target.value)}
                required
                placeholder="Nombres"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="apellidos">Apellidos</label>
              <input
                id="apellidos"
                type="text"
                className="form-input"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                required
                placeholder="Apellidos"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="idUsuario">Cuenta de Usuario Asociada</label>
            <select
              id="idUsuario"
              className="form-input"
              value={idUsuario}
              onChange={(e) => setIdUsuario(e.target.value ? Number(e.target.value) : '')}
              required
            >
              <option value="">Seleccione una cuenta de usuario...</option>
              {usuarios.map((user) => (
                <option key={user.id_usuario} value={user.id_usuario}>
                  {user.correo}
                </option>
              ))}
            </select>
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
        title="Eliminar Médico"
        message={`¿Está seguro de que desea eliminar al médico "${medicoToDelete?.nombres} ${medicoToDelete?.apellidos}"?`}
        loading={deleting}
      />
    </div>
  );
};

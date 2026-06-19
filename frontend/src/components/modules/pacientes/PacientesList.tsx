import React, { useEffect, useState } from 'react';
import { apiService } from '../../../services/api.service';
import { DataTable, type Column } from '../../ui/DataTable';
import { Modal } from '../../ui/Modal';
import { ConfirmDialog } from '../../ui/ConfirmDialog';

interface Usuario {
  id_usuario: number;
  correo: string;
}

interface Paciente {
  id_paciente: number;
  id_usuario: number | null;
  dni: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  fecha_nacimiento: string | null;
  usuario: Usuario | null;
}

export const PacientesList: React.FC = () => {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null);
  const [dni, setDni] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [idUsuario, setIdUsuario] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pacienteToDelete, setPacienteToDelete] = useState<Paciente | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const pacData = await apiService.getAll<Paciente>('pacientes');
      setPacientes(pacData);
      
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
    setEditingPaciente(null);
    setDni('');
    setNombres('');
    setApellidos('');
    setTelefono('');
    setFechaNacimiento('');
    setIdUsuario('');
    setModalOpen(true);
  };

  const handleOpenEdit = (paciente: Paciente) => {
    setEditingPaciente(paciente);
    setDni(paciente.dni);
    setNombres(paciente.nombres);
    setApellidos(paciente.apellidos);
    setTelefono(paciente.telefono || '');
    // Formatear fecha a YYYY-MM-DD para el input date
    if (paciente.fecha_nacimiento) {
      setFechaNacimiento(paciente.fecha_nacimiento.substring(0, 10));
    } else {
      setFechaNacimiento('');
    }
    setIdUsuario(paciente.id_usuario || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        dni,
        nombres,
        apellidos,
        telefono: telefono || null,
        fecha_nacimiento: fechaNacimiento || null,
        id_usuario: idUsuario ? Number(idUsuario) : null,
      };

      if (editingPaciente) {
        await apiService.update<Paciente>('pacientes', editingPaciente.id_paciente, payload);
      } else {
        await apiService.create<Paciente>('pacientes', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al guardar el paciente.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (paciente: Paciente) => {
    setPacienteToDelete(paciente);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!pacienteToDelete) return;
    setDeleting(true);
    try {
      await apiService.delete('pacientes', pacienteToDelete.id_paciente);
      setDeleteDialogOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el paciente.');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<Paciente>[] = [
    { key: 'dni', label: 'DNI' },
    { 
      key: 'paciente', 
      label: 'Paciente',
      render: (item) => `${item.nombres} ${item.apellidos}`
    },
    { key: 'telefono', label: 'Teléfono' },
    { 
      key: 'fecha_nacimiento', 
      label: 'F. Nacimiento',
      render: (item) => item.fecha_nacimiento ? new Date(item.fecha_nacimiento).toLocaleDateString('es-ES') : '-'
    },
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
          <h1 className="module-title">Pacientes</h1>
          <p className="module-subtitle">Base de datos de historias clínicas e información de contacto.</p>
        </div>
        <button className="btn btn-primary btn-add" onClick={handleOpenCreate}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '8px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Registrar Paciente
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <DataTable
        columns={columns}
        data={pacientes}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPaciente ? 'Editar Paciente' : 'Registrar Paciente'}
      >
        <form onSubmit={handleSave} className="modal-form">
          <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="dni">DNI</label>
              <input
                id="dni"
                type="text"
                className="form-input"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                required
                placeholder="Número de DNI"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="telefono">Teléfono</label>
              <input
                id="telefono"
                type="text"
                className="form-input"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: +51 987654321"
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
            <label className="form-label" htmlFor="fechaNacimiento">Fecha de Nacimiento</label>
            <input
              id="fechaNacimiento"
              type="date"
              className="form-input"
              value={fechaNacimiento}
              onChange={(e) => setFechaNacimiento(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="idUsuario">Vincular a Cuenta de Usuario (Opcional)</label>
            <select
              id="idUsuario"
              className="form-input"
              value={idUsuario}
              onChange={(e) => setIdUsuario(e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">No vincular a ninguna cuenta</option>
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
        title="Eliminar Paciente"
        message={`¿Está seguro de que desea eliminar al paciente "${pacienteToDelete?.nombres} ${pacienteToDelete?.apellidos}"? Esta acción eliminará su historia clínica.`}
        loading={deleting}
      />
    </div>
  );
};

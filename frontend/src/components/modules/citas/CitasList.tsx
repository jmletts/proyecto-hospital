import React, { useEffect, useState } from 'react';
import { apiService } from '../../../services/api.service';
import { DataTable, type Column } from '../../ui/DataTable';
import { Modal } from '../../ui/Modal';
import { ConfirmDialog } from '../../ui/ConfirmDialog';

interface Paciente {
  id_paciente: number;
  nombres: string;
  apellidos: string;
}

interface Medico {
  id_medico: number;
  nombres: string;
  apellidos: string;
}

interface Servicio {
  id_servicio: number;
  nombre: string;
  precio: number | string;
}

interface Cita {
  id_cita: number;
  id_paciente: number;
  id_medico: number;
  id_servicio: number;
  fecha_hora: string;
  estado: string;
  motivo_consulta: string | null;
  paciente: Paciente;
  medico: Medico;
  servicio: Servicio;
}

export const CitasList: React.FC = () => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCita, setEditingCita] = useState<Cita | null>(null);
  const [idPaciente, setIdPaciente] = useState<number | ''>('');
  const [idMedico, setIdMedico] = useState<number | ''>('');
  const [idServicio, setIdServicio] = useState<number | ''>('');
  const [fechaHora, setFechaHora] = useState('');
  const [estado, setEstado] = useState('Pendiente');
  const [motivo, setMotivo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [citaToDelete, setCitaToDelete] = useState<Cita | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [citasData, pacData, medData, servData] = await Promise.all([
        apiService.getAll<Cita>('citas'),
        apiService.getAll<Paciente>('pacientes'),
        apiService.getAll<Medico>('medicos'),
        apiService.getAll<Servicio>('servicios'),
      ]);
      setCitas(citasData);
      setPacientes(pacData);
      setMedicos(medData);
      setServicios(servData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos de las citas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingCita(null);
    setIdPaciente(pacientes.length > 0 ? pacientes[0].id_paciente : '');
    setIdMedico(medicos.length > 0 ? medicos[0].id_medico : '');
    setIdServicio(servicios.length > 0 ? servicios[0].id_servicio : '');
    setFechaHora('');
    setEstado('Pendiente');
    setMotivo('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cita: Cita) => {
    setEditingCita(cita);
    setIdPaciente(cita.id_paciente);
    setIdMedico(cita.id_medico);
    setIdServicio(cita.id_servicio);
    // Convertir ISO string a YYYY-MM-DDThh:mm para input datetime-local
    if (cita.fecha_hora) {
      const dt = new Date(cita.fecha_hora);
      // Ajuste local offset
      const tzOffset = dt.getTimezoneOffset() * 60000;
      const localISOTime = new Date(dt.getTime() - tzOffset).toISOString().slice(0, 16);
      setFechaHora(localISOTime);
    } else {
      setFechaHora('');
    }
    setEstado(cita.estado);
    setMotivo(cita.motivo_consulta || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idPaciente || !idMedico || !idServicio || !fechaHora) {
      return alert('Por favor complete todos los campos obligatorios.');
    }

    setSubmitting(true);
    try {
      const payload = {
        id_paciente: Number(idPaciente),
        id_medico: Number(idMedico),
        id_servicio: Number(idServicio),
        fecha_hora: new Date(fechaHora).toISOString(),
        estado,
        motivo_consulta: motivo || null,
      };

      if (editingCita) {
        await apiService.update<Cita>('citas', editingCita.id_cita, payload);
      } else {
        await apiService.create<Cita>('citas', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al guardar la cita.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (cita: Cita) => {
    setCitaToDelete(cita);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!citaToDelete) return;
    setDeleting(true);
    try {
      await apiService.delete('citas', citaToDelete.id_cita);
      setDeleteDialogOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar la cita.');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<Cita>[] = [
    { 
      key: 'fecha_hora', 
      label: 'Fecha y Hora',
      render: (item) => new Date(item.fecha_hora).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
    },
    { 
      key: 'paciente', 
      label: 'Paciente',
      render: (item) => item.paciente ? `${item.paciente.nombres} ${item.paciente.apellidos}` : '-'
    },
    { 
      key: 'medico', 
      label: 'Médico',
      render: (item) => item.medico ? `${item.medico.nombres} ${item.medico.apellidos}` : '-'
    },
    { 
      key: 'servicio', 
      label: 'Servicio',
      render: (item) => item.servicio?.nombre || '-'
    },
    { 
      key: 'estado', 
      label: 'Estado',
      render: (item) => {
        let badgeClass = 'badge-warning';
        if (item.estado === 'Completada') badgeClass = 'badge-success';
        if (item.estado === 'Cancelada') badgeClass = 'badge-danger';
        return (
          <span className={`badge ${badgeClass}`}>
            {item.estado}
          </span>
        );
      }
    },
  ];

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h1 className="module-title">Citas Médicas</h1>
          <p className="module-subtitle">Programa y controla el estado de las citas oftálmicas.</p>
        </div>
        <button className="btn btn-primary btn-add" onClick={handleOpenCreate}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '8px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva Cita
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <DataTable
        columns={columns}
        data={citas}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCita ? 'Editar Cita' : 'Programar Nueva Cita'}
      >
        <form onSubmit={handleSave} className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="idPaciente">Paciente</label>
            <select
              id="idPaciente"
              className="form-input"
              value={idPaciente}
              onChange={(e) => setIdPaciente(e.target.value ? Number(e.target.value) : '')}
              required
            >
              <option value="">Seleccione un paciente...</option>
              {pacientes.map((p) => (
                <option key={p.id_paciente} value={p.id_paciente}>
                  {p.nombres} {p.apellidos}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="idMedico">Médico</label>
              <select
                id="idMedico"
                className="form-input"
                value={idMedico}
                onChange={(e) => setIdMedico(e.target.value ? Number(e.target.value) : '')}
                required
              >
                <option value="">Seleccione...</option>
                {medicos.map((m) => (
                  <option key={m.id_medico} value={m.id_medico}>
                    {m.nombres} {m.apellidos}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="idServicio">Servicio</label>
              <select
                id="idServicio"
                className="form-input"
                value={idServicio}
                onChange={(e) => setIdServicio(e.target.value ? Number(e.target.value) : '')}
                required
              >
                <option value="">Seleccione...</option>
                {servicios.map((s) => (
                  <option key={s.id_servicio} value={s.id_servicio}>
                    {s.nombre} (S/. {Number(s.precio).toFixed(2)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="fechaHora">Fecha y Hora</label>
              <input
                id="fechaHora"
                type="datetime-local"
                className="form-input"
                value={fechaHora}
                onChange={(e) => setFechaHora(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="estado">Estado</label>
              <select
                id="estado"
                className="form-input"
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                required
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Completada">Completada</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="motivo">Motivo de Consulta (Opcional)</label>
            <textarea
              id="motivo"
              className="form-input"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Detalle el motivo de la cita oftálmica..."
              style={{ minHeight: '80px', resize: 'vertical' }}
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
        title="Eliminar Cita"
        message={`¿Está seguro de que desea eliminar esta cita programada?`}
        loading={deleting}
      />
    </div>
  );
};

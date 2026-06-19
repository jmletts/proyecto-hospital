import React, { useEffect, useState } from 'react';
import { apiService } from '../../../services/api.service';
import { DataTable, type Column } from '../../ui/DataTable';
import { Modal } from '../../ui/Modal';
import { ConfirmDialog } from '../../ui/ConfirmDialog';

interface Paciente {
  id_paciente: number;
  nombres: string;
  apellidos: string;
  dni: string;
}

interface Cita {
  id_cita: number;
  id_paciente: number;
  fecha_hora: string;
  servicio: { nombre: string };
}

interface HistoriaClinica {
  id_historia: number;
  id_paciente: number;
  id_cita: number;
  fecha_registro: string;
  agudeza_visual_od: string | null;
  agudeza_visual_oi: string | null;
  presion_intraocular_od: string | null;
  presion_intraocular_oi: string | null;
  diagnostico: string | null;
  observaciones: string | null;
  paciente: Paciente;
  cita: Cita;
}

export const HistoriasList: React.FC = () => {
  const [historias, setHistorias] = useState<HistoriaClinica[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHistoria, setEditingHistoria] = useState<HistoriaClinica | null>(null);
  const [idPaciente, setIdPaciente] = useState<number | ''>('');
  const [idCita, setIdCita] = useState<number | ''>('');
  const [avOd, setAvOd] = useState('');
  const [avOi, setAvOi] = useState('');
  const [pioOd, setPioOd] = useState('');
  const [pioOi, setPioOi] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [historiaToDelete, setHistoriaToDelete] = useState<HistoriaClinica | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [histData, pacData, citasData] = await Promise.all([
        apiService.getAll<HistoriaClinica>('historias'),
        apiService.getAll<Paciente>('pacientes'),
        apiService.getAll<Cita>('citas'),
      ]);
      setHistorias(histData);
      setPacientes(pacData);
      setCitas(citasData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtrar citas que pertenecen al paciente seleccionado
  const filteredCitas = citas.filter((c) => c.id_paciente === Number(idPaciente));

  const handleOpenCreate = () => {
    setEditingHistoria(null);
    const initialPac = pacientes.length > 0 ? pacientes[0].id_paciente : '';
    setIdPaciente(initialPac);
    // Buscar primera cita de este paciente
    const matchingCitas = citas.filter((c) => c.id_paciente === initialPac);
    setIdCita(matchingCitas.length > 0 ? matchingCitas[0].id_cita : '');
    setAvOd('');
    setAvOi('');
    setPioOd('');
    setPioOi('');
    setDiagnostico('');
    setObservaciones('');
    setModalOpen(true);
  };

  const handleOpenEdit = (historia: HistoriaClinica) => {
    setEditingHistoria(historia);
    setIdPaciente(historia.id_paciente);
    setIdCita(historia.id_cita);
    setAvOd(historia.agudeza_visual_od || '');
    setAvOi(historia.agudeza_visual_oi || '');
    setPioOd(historia.presion_intraocular_od || '');
    setPioOi(historia.presion_intraocular_oi || '');
    setDiagnostico(historia.diagnostico || '');
    setObservaciones(historia.observaciones || '');
    setModalOpen(true);
  };

  const handlePacienteChange = (pacId: number) => {
    setIdPaciente(pacId);
    const matchingCitas = citas.filter((c) => c.id_paciente === pacId);
    setIdCita(matchingCitas.length > 0 ? matchingCitas[0].id_cita : '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idPaciente || !idCita) {
      return alert('Debe seleccionar un paciente y una cita médica.');
    }

    setSubmitting(true);
    try {
      const payload = {
        id_paciente: Number(idPaciente),
        id_cita: Number(idCita),
        agudeza_visual_od: avOd || null,
        agudeza_visual_oi: avOi || null,
        presion_intraocular_od: pioOd || null,
        presion_intraocular_oi: pioOi || null,
        diagnostico: diagnostico || null,
        observaciones: observaciones || null,
      };

      if (editingHistoria) {
        await apiService.update<HistoriaClinica>('historias', editingHistoria.id_historia, payload);
      } else {
        await apiService.create<HistoriaClinica>('historias', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al guardar la historia clínica.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (historia: HistoriaClinica) => {
    setHistoriaToDelete(historia);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!historiaToDelete) return;
    setDeleting(true);
    try {
      await apiService.delete('historias', historiaToDelete.id_historia);
      setDeleteDialogOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar la historia clínica.');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<HistoriaClinica>[] = [
    { 
      key: 'fecha_registro', 
      label: 'Fecha Registro',
      render: (item) => new Date(item.fecha_registro).toLocaleDateString('es-ES')
    },
    { 
      key: 'paciente', 
      label: 'Paciente',
      render: (item) => item.paciente ? `${item.paciente.nombres} ${item.paciente.apellidos}` : '-'
    },
    { 
      key: 'agudeza_visual', 
      label: 'Agudeza OD/OI',
      render: (item) => `OD: ${item.agudeza_visual_od || '-'} / OI: ${item.agudeza_visual_oi || '-'}`
    },
    { 
      key: 'presion', 
      label: 'PI Intraocular OD/OI',
      render: (item) => `OD: ${item.presion_intraocular_od || '-'} / OI: ${item.presion_intraocular_oi || '-'}`
    },
    { key: 'diagnostico', label: 'Diagnóstico' },
  ];

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h1 className="module-title">Historias Clínicas</h1>
          <p className="module-subtitle">Registro oftálmico de medidas de agudeza visual y diagnósticos.</p>
        </div>
        <button className="btn btn-primary btn-add" onClick={handleOpenCreate}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '8px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva Historia
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <DataTable
        columns={columns}
        data={historias}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingHistoria ? 'Editar Historia Clínica' : 'Registrar Historia Clínica'}
      >
        <form onSubmit={handleSave} className="modal-form">
          <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="idPaciente">Paciente</label>
              <select
                id="idPaciente"
                className="form-input"
                value={idPaciente}
                onChange={(e) => handlePacienteChange(Number(e.target.value))}
                required
              >
                <option value="">Seleccione un paciente...</option>
                {pacientes.map((p) => (
                  <option key={p.id_paciente} value={p.id_paciente}>
                    {p.nombres} {p.apellidos} ({p.dni})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="idCita">Cita Vinculada</label>
              <select
                id="idCita"
                className="form-input"
                value={idCita}
                onChange={(e) => setIdCita(Number(e.target.value))}
                required
              >
                <option value="">Seleccione una cita...</option>
                {filteredCitas.map((c) => (
                  <option key={c.id_cita} value={c.id_cita}>
                    Cita: {new Date(c.fecha_hora).toLocaleDateString('es-ES')} - {c.servicio?.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '12px', color: 'var(--accent-color)', fontSize: '14px', fontWeight: 600 }}>Agudeza Visual (OD / OI)</h4>
            <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label" htmlFor="avOd">Ojo Derecho (OD)</label>
                <input
                  id="avOd"
                  type="text"
                  className="form-input"
                  value={avOd}
                  onChange={(e) => setAvOd(e.target.value)}
                  placeholder="Ej: 20/20"
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label" htmlFor="avOi">Ojo Izquierdo (OI)</label>
                <input
                  id="avOi"
                  type="text"
                  className="form-input"
                  value={avOi}
                  onChange={(e) => setAvOi(e.target.value)}
                  placeholder="Ej: 20/30"
                />
              </div>
            </div>
          </div>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '12px', color: 'var(--accent-color)', fontSize: '14px', fontWeight: 600 }}>Presión Intraocular (mmHg)</h4>
            <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label" htmlFor="pioOd">Ojo Derecho (OD)</label>
                <input
                  id="pioOd"
                  type="text"
                  className="form-input"
                  value={pioOd}
                  onChange={(e) => setPioOd(e.target.value)}
                  placeholder="Ej: 15"
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label" htmlFor="pioOi">Ojo Izquierdo (OI)</label>
                <input
                  id="pioOi"
                  type="text"
                  className="form-input"
                  value={pioOi}
                  onChange={(e) => setPioOi(e.target.value)}
                  placeholder="Ej: 16"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="diagnostico">Diagnóstico</label>
            <input
              id="diagnostico"
              type="text"
              className="form-input"
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              required
              placeholder="Ej: Astigmatismo miópico compuesto"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="observaciones">Observaciones adicionales</label>
            <textarea
              id="observaciones"
              className="form-input"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Observaciones o notas adicionales..."
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
        title="Eliminar Historia Clínica"
        message={`¿Está seguro de que desea eliminar este registro clínico?`}
        loading={deleting}
      />
    </div>
  );
};

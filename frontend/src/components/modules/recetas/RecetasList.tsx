import React, { useEffect, useState } from 'react';
import { apiService } from '../../../services/api.service';
import { DataTable, type Column } from '../../ui/DataTable';
import { Modal } from '../../ui/Modal';
import { ConfirmDialog } from '../../ui/ConfirmDialog';

interface Paciente {
  nombres: string;
  apellidos: string;
  dni: string;
}

interface HistoriaClinica {
  id_historia: number;
  diagnostico: string | null;
  paciente: Paciente;
}

interface RecetaLentes {
  id_receta: number;
  id_historia: number;
  od_esfera: number | string | null;
  od_cilindro: number | string | null;
  od_eje: number | null;
  oi_esfera: number | string | null;
  oi_cilindro: number | string | null;
  oi_eje: number | null;
  adicion: number | string | null;
  distancia_pupilar: number | string | null;
  fecha_emision: string;
  historia: HistoriaClinica;
}

export const RecetasList: React.FC = () => {
  const [recetas, setRecetas] = useState<RecetaLentes[]>([]);
  const [historias, setHistorias] = useState<HistoriaClinica[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReceta, setEditingReceta] = useState<RecetaLentes | null>(null);
  const [idHistoria, setIdHistoria] = useState<number | ''>('');
  
  // OD
  const [odEsfera, setOdEsfera] = useState('');
  const [odCilindro, setOdCilindro] = useState('');
  const [odEje, setOdEje] = useState('');
  
  // OI
  const [oiEsfera, setOiEsfera] = useState('');
  const [oiCilindro, setOiCilindro] = useState('');
  const [oiEje, setOiEje] = useState('');

  // Adicionales
  const [adicion, setAdicion] = useState('');
  const [distanciaPupilar, setDistanciaPupilar] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recetaToDelete, setRecetaToDelete] = useState<RecetaLentes | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [recData, histData] = await Promise.all([
        apiService.getAll<RecetaLentes>('recetas'),
        apiService.getAll<HistoriaClinica>('historias'),
      ]);
      setRecetas(recData);
      setHistorias(histData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los datos de recetas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingReceta(null);
    setIdHistoria(historias.length > 0 ? historias[0].id_historia : '');
    setOdEsfera('');
    setOdCilindro('');
    setOdEje('');
    setOiEsfera('');
    setOiCilindro('');
    setOiEje('');
    setAdicion('');
    setDistanciaPupilar('');
    setModalOpen(true);
  };

  const handleOpenEdit = (receta: RecetaLentes) => {
    setEditingReceta(receta);
    setIdHistoria(receta.id_historia);
    setOdEsfera(receta.od_esfera?.toString() || '');
    setOdCilindro(receta.od_cilindro?.toString() || '');
    setOdEje(receta.od_eje?.toString() || '');
    setOiEsfera(receta.oi_esfera?.toString() || '');
    setOiCilindro(receta.oi_cilindro?.toString() || '');
    setOiEje(receta.oi_eje?.toString() || '');
    setAdicion(receta.adicion?.toString() || '');
    setDistanciaPupilar(receta.distancia_pupilar?.toString() || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idHistoria) return alert('Debe seleccionar una historia clínica.');

    setSubmitting(true);
    try {
      const payload = {
        id_historia: Number(idHistoria),
        od_esfera: odEsfera ? Number(odEsfera) : null,
        od_cilindro: odCilindro ? Number(odCilindro) : null,
        od_eje: odEje ? Number(odEje) : null,
        oi_esfera: oiEsfera ? Number(oiEsfera) : null,
        oi_cilindro: oiCilindro ? Number(oiCilindro) : null,
        oi_eje: oiEje ? Number(oiEje) : null,
        adicion: adicion ? Number(adicion) : null,
        distancia_pupilar: distanciaPupilar ? Number(distanciaPupilar) : null,
      };

      if (editingReceta) {
        await apiService.update<RecetaLentes>('recetas', editingReceta.id_receta, payload);
      } else {
        await apiService.create<RecetaLentes>('recetas', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al guardar la receta.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (receta: RecetaLentes) => {
    setRecetaToDelete(receta);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!recetaToDelete) return;
    setDeleting(true);
    try {
      await apiService.delete('recetas', recetaToDelete.id_receta);
      setDeleteDialogOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar la receta.');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<RecetaLentes>[] = [
    { 
      key: 'fecha_emision', 
      label: 'Fecha Emisión',
      render: (item) => new Date(item.fecha_emision).toLocaleDateString('es-ES')
    },
    { 
      key: 'paciente', 
      label: 'Paciente',
      render: (item) => item.historia?.paciente ? `${item.historia.paciente.nombres} ${item.historia.paciente.apellidos}` : '-'
    },
    { 
      key: 'od', 
      label: 'Ojo Derecho (Esf/Cil/Eje)',
      render: (item) => `${item.od_esfera || '0.00'} / ${item.od_cilindro || '0.00'} x ${item.od_eje || '0'}°`
    },
    { 
      key: 'oi', 
      label: 'Ojo Izquierdo (Esf/Cil/Eje)',
      render: (item) => `${item.oi_esfera || '0.00'} / ${item.oi_cilindro || '0.00'} x ${item.oi_eje || '0'}°`
    },
    { key: 'distancia_pupilar', label: 'D.P. (mm)' },
  ];

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h1 className="module-title">Recetas de Lentes</h1>
          <p className="module-subtitle">Administra los parámetros de refracción óptica de los pacientes.</p>
        </div>
        <button className="btn btn-primary btn-add" onClick={handleOpenCreate}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '8px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva Receta
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <DataTable
        columns={columns}
        data={recetas}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingReceta ? 'Editar Receta' : 'Registrar Nueva Receta'}
      >
        <form onSubmit={handleSave} className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="idHistoria">Historia Clínica Relacionada</label>
            <select
              id="idHistoria"
              className="form-input"
              value={idHistoria}
              onChange={(e) => setIdHistoria(e.target.value ? Number(e.target.value) : '')}
              required
            >
              <option value="">Seleccione una historia...</option>
              {historias.map((h) => (
                <option key={h.id_historia} value={h.id_historia}>
                  Historial: {h.paciente.nombres} {h.paciente.apellidos} ({h.diagnostico})
                </option>
              ))}
            </select>
          </div>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '12px', color: 'var(--accent-color)', fontSize: '14px', fontWeight: 600 }}>Ojo Derecho (OD)</h4>
            <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label" htmlFor="odEsfera">Esfera (DP)</label>
                <input
                  id="odEsfera"
                  type="number"
                  step="0.25"
                  className="form-input"
                  value={odEsfera}
                  onChange={(e) => setOdEsfera(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label" htmlFor="odCilindro">Cilindro</label>
                <input
                  id="odCilindro"
                  type="number"
                  step="0.25"
                  className="form-input"
                  value={odCilindro}
                  onChange={(e) => setOdCilindro(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label" htmlFor="odEje">Eje (°)</label>
                <input
                  id="odEje"
                  type="number"
                  className="form-input"
                  value={odEje}
                  onChange={(e) => setOdEje(e.target.value)}
                  placeholder="Grados"
                />
              </div>
            </div>
          </div>

          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
            <h4 style={{ marginBottom: '12px', color: 'var(--accent-color)', fontSize: '14px', fontWeight: 600 }}>Ojo Izquierdo (OI)</h4>
            <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label" htmlFor="oiEsfera">Esfera (DP)</label>
                <input
                  id="oiEsfera"
                  type="number"
                  step="0.25"
                  className="form-input"
                  value={oiEsfera}
                  onChange={(e) => setOiEsfera(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label" htmlFor="oiCilindro">Cilindro</label>
                <input
                  id="oiCilindro"
                  type="number"
                  step="0.25"
                  className="form-input"
                  value={oiCilindro}
                  onChange={(e) => setOiCilindro(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                <label className="form-label" htmlFor="oiEje">Eje (°)</label>
                <input
                  id="oiEje"
                  type="number"
                  className="form-input"
                  value={oiEje}
                  onChange={(e) => setOiEje(e.target.value)}
                  placeholder="Grados"
                />
              </div>
            </div>
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="adicion">Adición</label>
              <input
                id="adicion"
                type="number"
                step="0.25"
                className="form-input"
                value={adicion}
                onChange={(e) => setAdicion(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="distanciaPupilar">Distancia Pupilar (mm)</label>
              <input
                id="distanciaPupilar"
                type="number"
                step="0.5"
                className="form-input"
                value={distanciaPupilar}
                onChange={(e) => setDistanciaPupilar(e.target.value)}
                placeholder="Ej: 62"
              />
            </div>
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
        title="Eliminar Receta"
        message={`¿Está seguro de que desea eliminar esta receta de lentes?`}
        loading={deleting}
      />
    </div>
  );
};

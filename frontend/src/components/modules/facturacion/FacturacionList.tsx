import React, { useEffect, useState } from 'react';
import { apiService } from '../../../services/api.service';
import { DataTable, type Column } from '../../ui/DataTable';
import { Modal } from '../../ui/Modal';
import { ConfirmDialog } from '../../ui/ConfirmDialog';

interface Paciente {
  nombres: string;
  apellidos: string;
}

interface Servicio {
  nombre: string;
  precio: number | string;
}

interface Cita {
  id_cita: number;
  fecha_hora: string;
  paciente: Paciente;
  servicio: Servicio;
}

interface Facturacion {
  id_factura: number;
  id_cita: number;
  monto_total: number | string;
  fecha_emision: string;
  metodo_pago: string;
  estado_pago: string;
  cita: Cita;
}

export const FacturacionList: React.FC = () => {
  const [facturaciones, setFacturaciones] = useState<Facturacion[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFacturacion, setEditingFacturacion] = useState<Facturacion | null>(null);
  const [idCita, setIdCita] = useState<number | ''>('');
  const [montoTotal, setMontoTotal] = useState('');
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [estadoPago, setEstadoPago] = useState('Pendiente');
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [facturacionToDelete, setFacturacionToDelete] = useState<Facturacion | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [factData, citasData] = await Promise.all([
        apiService.getAll<Facturacion>('facturacion'),
        apiService.getAll<Cita>('citas'),
      ]);
      setFacturaciones(factData);
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

  const handleOpenCreate = () => {
    setEditingFacturacion(null);
    const initialCita = citas.length > 0 ? citas[0] : null;
    setIdCita(initialCita ? initialCita.id_cita : '');
    setMontoTotal(initialCita ? Number(initialCita.servicio.precio).toString() : '');
    setMetodoPago('Efectivo');
    setEstadoPago('Pendiente');
    setModalOpen(true);
  };

  const handleOpenEdit = (fact: Facturacion) => {
    setEditingFacturacion(fact);
    setIdCita(fact.id_cita);
    setMontoTotal(fact.monto_total.toString());
    setMetodoPago(fact.metodo_pago);
    setEstadoPago(fact.estado_pago);
    setModalOpen(true);
  };

  const handleCitaChange = (citaId: number) => {
    setIdCita(citaId);
    const selected = citas.find((c) => c.id_cita === citaId);
    if (selected) {
      setMontoTotal(Number(selected.servicio.precio).toString());
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCita || !montoTotal) {
      return alert('Debe completar todos los campos obligatorios.');
    }

    setSubmitting(true);
    try {
      const payload = {
        id_cita: Number(idCita),
        monto_total: Number(montoTotal),
        metodo_pago: metodoPago,
        estado_pago: estadoPago,
      };

      if (editingFacturacion) {
        await apiService.update<Facturacion>('facturacion', editingFacturacion.id_factura, payload);
      } else {
        await apiService.create<Facturacion>('facturacion', payload);
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al guardar la facturación.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (fact: Facturacion) => {
    setFacturacionToDelete(fact);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!facturacionToDelete) return;
    setDeleting(true);
    try {
      await apiService.delete('facturacion', facturacionToDelete.id_factura);
      setDeleteDialogOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el registro de facturación.');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<Facturacion>[] = [
    { 
      key: 'fecha_emision', 
      label: 'Fecha Emisión',
      render: (item) => new Date(item.fecha_emision).toLocaleDateString('es-ES')
    },
    { 
      key: 'paciente', 
      label: 'Paciente',
      render: (item) => item.cita?.paciente ? `${item.cita.paciente.nombres} ${item.cita.paciente.apellidos}` : '-'
    },
    { 
      key: 'servicio', 
      label: 'Servicio / Cita',
      render: (item) => item.cita?.servicio ? `${item.cita.servicio.nombre}` : '-'
    },
    { 
      key: 'monto_total', 
      label: 'Monto Total',
      render: (item) => `S/. ${Number(item.monto_total).toFixed(2)}`
    },
    { key: 'metodo_pago', label: 'Método de Pago' },
    { 
      key: 'estado_pago', 
      label: 'Estado Pago',
      render: (item) => {
        let badgeClass = 'badge-warning';
        if (item.estado_pago === 'Pagado') badgeClass = 'badge-success';
        if (item.estado_pago === 'Anulado') badgeClass = 'badge-danger';
        return (
          <span className={`badge ${badgeClass}`}>
            {item.estado_pago}
          </span>
        );
      }
    },
  ];

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h1 className="module-title">Facturación</h1>
          <p className="module-subtitle">Control de caja, cobros de consultas y cirugías.</p>
        </div>
        <button className="btn btn-primary btn-add" onClick={handleOpenCreate}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '8px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Registrar Cobro
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <DataTable
        columns={columns}
        data={facturaciones}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingFacturacion ? 'Editar Cobro' : 'Registrar Cobro'}
      >
        <form onSubmit={handleSave} className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="idCita">Cita Médica</label>
            <select
              id="idCita"
              className="form-input"
              value={idCita}
              onChange={(e) => handleCitaChange(Number(e.target.value))}
              required
            >
              <option value="">Seleccione una cita...</option>
              {citas.map((c) => (
                <option key={c.id_cita} value={c.id_cita}>
                  Cita: {new Date(c.fecha_hora).toLocaleDateString('es-ES')} - {c.paciente.nombres} {c.paciente.apellidos} ({c.servicio.nombre})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="montoTotal">Monto Total (S/.)</label>
            <input
              id="montoTotal"
              type="number"
              step="0.01"
              className="form-input"
              value={montoTotal}
              onChange={(e) => setMontoTotal(e.target.value)}
              required
              placeholder="0.00"
            />
          </div>

          <div className="form-row" style={{ display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="metodoPago">Método de Pago</label>
              <select
                id="metodoPago"
                className="form-input"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                required
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta de Crédito/Débito</option>
                <option value="Transferencia">Transferencia Bancaria</option>
                <option value="Yape/Plin">Yape / Plin</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="estadoPago">Estado de Pago</label>
              <select
                id="estadoPago"
                className="form-input"
                value={estadoPago}
                onChange={(e) => setEstadoPago(e.target.value)}
                required
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Pagado">Pagado</option>
                <option value="Anulado">Anulado</option>
              </select>
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
        title="Eliminar Registro de Cobro"
        message={`¿Está seguro de que desea eliminar este cobro facturado?`}
        loading={deleting}
      />
    </div>
  );
};

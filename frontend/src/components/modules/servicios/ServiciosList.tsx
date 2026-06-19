import React, { useEffect, useState } from 'react';
import { apiService } from '../../../services/api.service';
import { DataTable, type Column } from '../../ui/DataTable';
import { Modal } from '../../ui/Modal';
import { ConfirmDialog } from '../../ui/ConfirmDialog';

interface Servicio {
  id_servicio: number;
  nombre: string;
  descripcion: string | null;
  precio: number | string;
}

export const ServiciosList: React.FC = () => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [servicioToDelete, setServicioToDelete] = useState<Servicio | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchServicios = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAll<Servicio>('servicios');
      setServicios(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los servicios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicios();
  }, []);

  const handleOpenCreate = () => {
    setEditingServicio(null);
    setNombre('');
    setDescripcion('');
    setPrecio('');
    setModalOpen(true);
  };

  const handleOpenEdit = (serv: Servicio) => {
    setEditingServicio(serv);
    setNombre(serv.nombre);
    setDescripcion(serv.descripcion || '');
    setPrecio(serv.precio.toString());
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(Number(precio)) || Number(precio) < 0) {
      return alert('El precio debe ser un número válido mayor o igual a cero.');
    }

    setSubmitting(true);
    try {
      const payload = {
        nombre,
        descripcion: descripcion || null,
        precio: Number(precio),
      };

      if (editingServicio) {
        await apiService.update<Servicio>('servicios', editingServicio.id_servicio, payload);
      } else {
        await apiService.create<Servicio>('servicios', payload);
      }
      setModalOpen(false);
      fetchServicios();
    } catch (err: any) {
      alert(err.message || 'Error al guardar el servicio.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDelete = (serv: Servicio) => {
    setServicioToDelete(serv);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!servicioToDelete) return;
    setDeleting(true);
    try {
      await apiService.delete('servicios', servicioToDelete.id_servicio);
      setDeleteDialogOpen(false);
      fetchServicios();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el servicio.');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<Servicio>[] = [
    { key: 'id_servicio', label: 'ID' },
    { key: 'nombre', label: 'Nombre del Servicio' },
    { key: 'descripcion', label: 'Descripción' },
    { 
      key: 'precio', 
      label: 'Precio (S/.)',
      render: (item) => `S/. ${Number(item.precio).toFixed(2)}`
    },
  ];

  return (
    <div className="module-container">
      <div className="module-header">
        <div>
          <h1 className="module-title">Servicios Médicos</h1>
          <p className="module-subtitle">Catálogo de consultas, tratamientos y procedimientos médicos.</p>
        </div>
        <button className="btn btn-primary btn-add" onClick={handleOpenCreate}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" style={{ width: '16px', height: '16px', marginRight: '8px' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Crear Servicio
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <DataTable
        columns={columns}
        data={servicios}
        loading={loading}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingServicio ? 'Editar Servicio' : 'Crear Servicio'}
      >
        <form onSubmit={handleSave} className="modal-form">
          <div className="form-group">
            <label className="form-label" htmlFor="nombre">Nombre del Servicio</label>
            <input
              id="nombre"
              type="text"
              className="form-input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Ej: Consulta General, Cirugía de Cataratas"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="precio">Precio (S/.)</label>
            <input
              id="precio"
              type="number"
              step="0.01"
              min="0"
              className="form-input"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              required
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              className="form-input"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles sobre el procedimiento o consulta..."
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
        title="Eliminar Servicio"
        message={`¿Está seguro de que desea eliminar el servicio "${servicioToDelete?.nombre}"?`}
        loading={deleting}
      />
    </div>
  );
};

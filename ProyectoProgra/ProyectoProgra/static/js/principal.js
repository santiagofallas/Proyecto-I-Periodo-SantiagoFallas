 let contactos = [];
        let currentPage = 1;
        let rowsPerPage = 5;
        let currentDeleteId = null;
        let contactosOriginal = [];

        function showLoading(show) {
            document.getElementById('loading').style.display = show ? 'block' : 'none';
        }

        function showError(msg) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-danger alert-dismissible fade show';
            alertDiv.innerHTML = msg + '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
            document.querySelector('.content').insertBefore(alertDiv, document.querySelector('.content').firstChild);
            setTimeout(() => alertDiv.remove(), 3000);
        }

        function showSuccess(msg) {
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert alert-success alert-dismissible fade show';
            alertDiv.innerHTML = msg + '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
            document.querySelector('.content').insertBefore(alertDiv, document.querySelector('.content').firstChild);
            setTimeout(() => alertDiv.remove(), 3000);
        }

        async function loadContactos() {
            showLoading(true);
            try {
                const response = await fetch('/api/contactos');
                if (response.status === 401) {
                    window.location.href = '/';
                    return;
                }
                if (!response.ok) throw new Error('Error al cargar');
                contactos = await response.json();
                contactosOriginal = [...contactos];
                currentPage = 1;
                renderTable();
            } catch (error) {
                showError('Error al cargar contactos');
            } finally {
                showLoading(false);
            }
        }

        function renderTable() {
            const start = (currentPage - 1) * rowsPerPage;
            const end = start + rowsPerPage;
            const pageContacts = contactos.slice(start, end);
            const tbody = document.getElementById('contactsTableBody');

            if (pageContacts.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay contactos</td></tr>';
                document.getElementById('paginationInfo').innerHTML = '0 contactos';
                document.getElementById('prevPageBtn').disabled = true;
                document.getElementById('nextPageBtn').disabled = true;
                return;
            }

            tbody.innerHTML = '';
            pageContacts.forEach(c => {
                const nombreCompleto = (c.nombre || '') + ' ' + (c.apellido || '');
                const estadoClass = c.estado === 'Activo' ? 'badge-activo' : 'badge-inactivo';
                const starClass = c.favorito ? 'star-active' : 'star-inactive';
                const starIcon = c.favorito ? 'bi-star-fill' : 'bi-star';
                tbody.innerHTML += `
                    <tr>
                        <td><i class="${starIcon} ${starClass}" onclick="toggleFavorite(${c.id})"></i></td>
                        <td><strong>${escapeHtml(nombreCompleto)}</strong></td>
                        <td>${escapeHtml(c.empresa || '-')}</td>
                        <td>${escapeHtml(c.telefono || '-')}</td>
                        <td>${escapeHtml(c.email || '-')}</td>
                        <td><span class="${estadoClass}">${c.estado || 'Activo'}</span></td>
                        <td>
                            <button class="btn btn-sm btn-outline-primary" onclick="verDetalles(${c.id})"><i class="bi bi-eye"></i></button>
                            <button class="btn btn-sm btn-outline-danger" onclick="confirmarEliminar(${c.id})"><i class="bi bi-trash"></i></button>
                        </td>
                    </tr>
                `;
            });

            const totalPages = Math.ceil(contactos.length / rowsPerPage);
            document.getElementById('paginationInfo').innerHTML = `Mostrando ${start + 1} - ${Math.min(end, contactos.length)} de ${contactos.length} contactos`;
            document.getElementById('prevPageBtn').disabled = currentPage === 1;
            document.getElementById('nextPageBtn').disabled = currentPage === totalPages;
        }

        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        async function toggleFavorite(id) {
            try {
                const response = await fetch(`/api/contactos/toggle-favorite/${id}`, { method: 'PATCH' });
                if (!response.ok) throw new Error();
                await loadContactos();
            } catch (error) {
                showError('Error al cambiar favorito');
            }
        }

        function verDetalles(id) {
            const c = contactos.find(c => c.id === id);
            if (!c) return;
            
            const iniciales = (c.nombre ? c.nombre[0] : '') + (c.apellido ? c.apellido[0] : '');
            const nombreCompleto = (c.nombre || '') + ' ' + (c.apellido || '');
            
            document.getElementById('detailsModalBody').innerHTML = `
                <div class="row">
                    <div class="col-md-4 text-center">
                        <div class="contact-photo-circle mx-auto">${iniciales || '👤'}</div>
                        <button class="btn btn-sm btn-outline-secondary mt-2" disabled><i class="bi bi-camera"></i> Actualizar foto</button>
                    </div>
                    <div class="col-md-8">
                        <div class="info-row"><div class="info-label">Nombre:</div><div class="info-value"><strong>${escapeHtml(nombreCompleto)}</strong></div></div>
                        <div class="info-row"><div class="info-label">Correo:</div><div class="info-value">${escapeHtml(c.email || '-')}</div></div>
                        <div class="info-row"><div class="info-label">Telefono:</div><div class="info-value">${escapeHtml(c.telefono || '-')}</div></div>
                        <div class="info-row"><div class="info-label">Empresa:</div><div class="info-value">${escapeHtml(c.empresa || '-')}</div></div>
                        <div class="info-row"><div class="info-label">Cargo:</div><div class="info-value">${escapeHtml(c.cargo || '-')}</div></div>
                        <div class="info-row"><div class="info-label">Direccion:</div><div class="info-value">${escapeHtml(c.direccion || '-')}</div></div>
                        <div class="info-row"><div class="info-label">Cumpleanos:</div><div class="info-value">${c.cumpleanos || '-'}</div></div>
                        <div class="info-row"><div class="info-label">Estado:</div><div class="info-value"><span class="${c.estado === 'Activo' ? 'badge-activo' : 'badge-inactivo'}">${c.estado || 'Activo'}</span></div></div>
                        <div class="info-row"><div class="info-label">Notas:</div><div class="info-value">${escapeHtml(c.notas) || 'Sin notas'}</div></div>
                        <div class="info-row"><div class="info-label">Favorito:</div><div class="info-value">${c.favorito ? '★ Si' : '☆ No'}</div></div>
                    </div>
                </div>
            `;
            
            const modal = new bootstrap.Modal(document.getElementById('detailsModal'));
            modal.show();
            
            document.getElementById('deleteFromDetailsBtn').onclick = () => {
                modal.hide();
                confirmarEliminar(id);
            };
        }

        function confirmarEliminar(id) {
            currentDeleteId = id;
            const c = contactos.find(c => c.id === id);
            const nombre = c ? (c.nombre || '') + ' ' + (c.apellido || '') : 'este contacto';
            document.getElementById('deleteConfirmMessage').innerHTML = `Se eliminara permanentemente a <strong>${escapeHtml(nombre)}</strong>`;
            new bootstrap.Modal(document.getElementById('confirmDeleteModal')).show();
        }

        async function executeDelete() {
            if (!currentDeleteId) return;
            try {
                const response = await fetch(`/api/contactos/${currentDeleteId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error();
                showSuccess('Contacto eliminado correctamente');
                await loadContactos();
                bootstrap.Modal.getInstance(document.getElementById('confirmDeleteModal')).hide();
                currentDeleteId = null;
            } catch (error) {
                showError('Error al eliminar');
            }
        }

        document.getElementById('contactForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const nuevo = {
                nombre: document.getElementById('nombre').value,
                apellido: document.getElementById('apellido').value,
                empresa: document.getElementById('empresa').value,
                cargo: document.getElementById('cargo').value,
                email: document.getElementById('email').value,
                telefono: document.getElementById('telefono').value,
                direccion: document.getElementById('direccion').value,
                cumpleanos: document.getElementById('cumpleanos').value,
                notas: document.getElementById('notas').value,
                estado: document.getElementById('estado').value,
                favorito: false
            };
            
            if (!nuevo.nombre || !nuevo.apellido || !nuevo.email || !nuevo.telefono) {
                showError('Complete los campos requeridos');
                return;
            }
            
            try {
                const response = await fetch('/api/contactos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevo)
                });
                if (!response.ok) throw new Error();
                showSuccess('Contacto agregado');
                document.getElementById('contactForm').reset();
                showSection('lista');
                await loadContactos();
            } catch (error) {
                showError('Error al agregar');
            }
        });

        document.getElementById('btnBuscar').addEventListener('click', () => {
            const nombre = document.getElementById('buscarNombre').value.toLowerCase();
            const empresa = document.getElementById('buscarEmpresa').value.toLowerCase();
            const favoritoVal = document.getElementById('buscarFavorito').value;
            
            if (!nombre && !empresa && !favoritoVal) {
                contactos = [...contactosOriginal];
                currentPage = 1;
                renderTable();
                document.getElementById('resultadoBusqueda').innerHTML = '';
                return;
            }
            
            const resultados = contactosOriginal.filter(c => {
                const nombreCompleto = ((c.nombre || '') + ' ' + (c.apellido || '')).toLowerCase();
                const matchNombre = !nombre || nombreCompleto.includes(nombre);
                const matchEmpresa = !empresa || (c.empresa && c.empresa.toLowerCase().includes(empresa));
                const matchFavorito = !favoritoVal || (favoritoVal === 'true' ? c.favorito : !c.favorito);
                return matchNombre && matchEmpresa && matchFavorito;
            });
            
            const div = document.getElementById('resultadoBusqueda');
            if (resultados.length === 0) {
                div.innerHTML = '<div class="alert alert-info">No se encontraron contactos</div>';
            } else {
                div.innerHTML = resultados.map(c => `
                    <div class="result-card">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5>${escapeHtml(c.nombre || '')} ${escapeHtml(c.apellido || '')}</h5>
                                <p class="mb-1 small"><i class="bi bi-building"></i> ${escapeHtml(c.empresa || 'Sin empresa')} | <i class="bi bi-briefcase"></i> ${escapeHtml(c.cargo || 'Sin cargo')}</p>
                                <p class="mb-0 small"><i class="bi bi-envelope"></i> ${escapeHtml(c.email || '-')} | <i class="bi bi-telephone"></i> ${escapeHtml(c.telefono || '-')}</p>
                            </div>
                            <button class="btn btn-sm btn-primary" onclick="verDetalles(${c.id})"><i class="bi bi-eye"></i> Ver detalles</button>
                        </div>
                    </div>
                `).join('');
            }
            
            contactos = resultados;
            currentPage = 1;
            renderTable();
        });

        function showSection(section) {
            document.getElementById('listaContactosSection').style.display = section === 'lista' ? 'block' : 'none';
            document.getElementById('agregarContactoSection').style.display = section === 'agregar' ? 'block' : 'none';
            document.getElementById('buscarContactoSection').style.display = section === 'buscar' ? 'block' : 'none';
            if (section === 'lista') loadContactos();
            if (section === 'buscar') {
                contactos = [...contactosOriginal];
                currentPage = 1;
                renderTable();
            }
        }

        document.getElementById('btnListaContactos').onclick = (e) => { e.preventDefault(); showSection('lista'); };
        document.getElementById('btnAgregarContacto').onclick = (e) => { e.preventDefault(); showSection('agregar'); };
        document.getElementById('btnBuscarContacto').onclick = (e) => { e.preventDefault(); showSection('buscar'); };
        document.getElementById('cancelarAgregar').onclick = () => showSection('lista');
        document.getElementById('btnDescargarReporte').onclick = (e) => { e.preventDefault(); window.location.href = '/api/descargar-reporte'; };
        document.getElementById('prevPageBtn').onclick = () => { if (currentPage > 1) { currentPage--; renderTable(); } };
        document.getElementById('nextPageBtn').onclick = () => { if (currentPage < Math.ceil(contactos.length / rowsPerPage)) { currentPage++; renderTable(); } };
        document.getElementById('confirmDeleteBtn').onclick = executeDelete;
        document.getElementById('menuToggle').onclick = () => document.getElementById('sidebar').classList.toggle('show');

        loadContactos();
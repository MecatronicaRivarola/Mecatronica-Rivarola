// Base de datos provisoria en el navegador vinculada a tu estructura de Vercel Storage
let autosTaller = JSON.parse(localStorage.getItem('mecatronica_autos')) || [
    { patente: 'AF 789 CD', chasis: 'CH93849201A837', auto: 'Peugeot 208 Sport 2022', cliente: 'Martín Rivarola', tel: '1155551234', falla: 'Falla eléctrica en tablero', repuestos: 'no', seña: 50000, metodo: 'Efectivo', estado: 'En Diagnóstico' }
];

let presupuestos = JSON.parse(localStorage.getItem('mecatronica_presupuestos')) || [];

// Al cargar la página, dibuja todo de inmediato
document.addEventListener('DOMContentLoaded', () => {
    actualizarTablaIngreso();
    actualizarTurnero();
    actualizarCaja();
    actualizarListaPresupuestos();
});

// FUNCIÓN: GUARDAR UN AUTO NUEVO
function guardarVehiculo() {
    const patente = document.getElementById('ins-patente').value.trim().toUpperCase();
    const chasis = document.getElementById('ins-chasis').value.trim().toUpperCase();
    const auto = document.getElementById('ins-auto').value.trim();
    const cliente = document.getElementById('ins-cliente').value.trim();
    const tel = document.getElementById('ins-tel').value.trim();
    const falla = document.getElementById('ins-falla').value.trim();
    const repuestos = document.getElementById('ins-repuestos').value;
    const seña = parseFloat(document.getElementById('ins-seña').value) || 0;
    const metodo = document.getElementById('ins-metodo').value;

    if (!patente || !auto || !cliente) {
        alert('⚠️ Por favor completa los campos obligatorios: Patente, Vehículo y Cliente.');
        return;
    }

    const nuevoAuto = { patente, chasis, auto, cliente, tel, falla, repuestos, seña, metodo, estado: 'En Taller' };
    autosTaller.push(nuevoAuto);
    
    // Lo graba a fuego para que no se borre al recargar
    localStorage.setItem('mecatronica_autos', JSON.stringify(autosTaller));

    // Limpia el formulario para el siguiente auto
    document.getElementById('form-ingreso').reset();
    
    // Actualiza todas las pantallas al mismo tiempo
    actualizarTablaIngreso();
    actualizarTurnero();
    actualizarCaja();
    alert('🚀 Vehículo ingresado correctamente al taller y registrado en la base de datos.');
}

// FUNCIÓN: RENDERIZAR TABLA DE INGRESO
function actualizarTablaIngreso() {
    const tbody = document.getElementById('tabla-ingreso-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    autosTaller.forEach((item, index) => {
        tbody.innerHTML += `
            <tr>
                <td><span class="patente">${item.patente}</span><br><span class="chasis">CH: ${item.chasis || 'S/N'}</span></td>
                <td><div style="font-weight:bold;">${item.auto}</div><div class="cliente">${item.cliente} • ${item.tel}</div></td>
                <td><div>${item.falla}</div><div class="badge-falla">${item.repuestos === 'si' ? 'Trajo repuestos' : 'Taller compra repuestos'}</div></td>
                <td>
                    <button class="btn-action btn-print" onclick="imprimirOrden('${item.patente}', '${item.auto}', '${item.cliente}', '${item.falla}')">🖨️ Orden</button>
                    <button class="btn-action btn-wa" onclick="enviarWhatsApp('${item.tel}', '${item.patente}', '${item.falla}')">📱 WA</button>
                </td>
            </tr>
        `;
    });
}

// FUNCIÓN: RENDERIZAR TURNERO GENERAL
function actualizarTurnero() {
    const tbody = document.getElementById('tabla-turnero-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    autosTaller.forEach((item, index) => {
        tbody.innerHTML += `
            <tr>
                <td class="patente">${item.patente}</td>
                <td><strong>${item.auto}</strong><br>${item.cliente}</td>
                <td>
                    <select onchange="cambiarEstado(${index}, this.value)" style="background:#030712; color:#fff; border:1px solid #374151; padding:4px; border-radius:6px;">
                        <option value="En Taller" ${item.estado === 'En Taller' ? 'selected' : ''}>En Taller</option>
                        <option value="En Diagnóstico" ${item.estado === 'En Diagnóstico' ? 'selected' : ''}>En Diagnóstico</option>
                        <option value="Esperando Repuestos" ${item.estado === 'Esperando Repuestos' ? 'selected' : ''}>Esperando Repuestos</option>
                        <option value="Listo para Entrega" ${item.estado === 'Listo para Entrega' ? 'selected' : ''}>Listo para Entrega</option>
                    </select>
                </td>
                <td><button class="btn-action btn-print" style="background-color:#991b1b;" onclick="eliminarAuto(${index})">❌ Entregar/Retirar</button></td>
            </tr>
        `;
    });
}

function cambiarEstado(index, nuevoEstado) {
    autosTaller[index].estado = nuevoEstado;
    localStorage.setItem('mecatronica_autos', JSON.stringify(autosTaller));
    actualizarTurnero();
}

function eliminarAuto(index) {
    if(confirm('¿Confirmas que el auto ya fue entregado y se retira del taller?')) {
        autosTaller.splice(index, 1);
        localStorage.setItem('mecatronica_autos', JSON.stringify(autosTaller));
        actualizarTablaIngreso();
        actualizarTurnero();
        actualizarCaja();
    }
}

// FUNCIÓN: GENERAR Y GUARDAR PRESUPUESTOS
function generarPresupuesto() {
    const patente = document.getElementById('pres-patente').value.toUpperCase();
    const repuestosMonto = parseFloat(document.getElementById('pres-repuestos').value) || 0;
    const manoObraMonto = parseFloat(document.getElementById('pres-mano').value) || 0;
    const detalle = document.getElementById('pres-detalle').value;

    if(!patente) { alert('Introduce una patente para el presupuesto'); return; }

    const total = repuestosMonto + manoObraMonto;
    const nuevoPres = { patente, repuestosMonto, manoObraMonto, detalle, total, fecha: new Date().toLocaleDateString() };
    
    presupuestos.push(nuevoPres);
    localStorage.setItem('mecatronica_presupuestos', JSON.stringify(presupuestos));
    
    document.getElementById('form-presupuesto').reset();
    actualizarListaPresupuestos();
    imprimirPresupuestoDirecto(nuevoPres);
}

function actualizarListaPresupuestos() {
    const tbody = document.getElementById('tabla-presupuestos-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    presupuestos.forEach(p => {
        tbody.innerHTML += `
            <tr>
                <td class="patente">${p.patente}</td>
                <td>${p.detalle}</td>
                <td>Rep: $${p.repuestosMonto} | MO: $${p.manoObraMonto}</td>
                <td style="color:#f97316; font-weight:bold;">$${p.total}</td>
            </tr>
        `;
    });
}

// FUNCIÓN: CONTROL DE CAJA
function actualizarCaja() {
    let totalSeñas = 0;
    let efectivo = 0;
    let transferencia = 0;

    autosTaller.forEach(item => {
        totalSeñas += item.seña;
        if(item.metodo.toLowerCase() === 'efectivo') efectivo += item.seña;
        if(item.metodo.toLowerCase() === 'transferencia') transferencia += item.seña;
    });

    document.getElementById('caja-total').innerText = '\$' + totalSeñas;
    document.getElementById('caja-efectivo').innerText = '\$' + efectivo;
    document.getElementById('caja-trans').innerText = '\$' + transferencia;
}

function imprimirPresupuestoDirecto(p) {
    const contenedor = document.getElementById('print-detalle');
    contenedor.innerHTML = `
        <h3>PRESUPUESTO DE REPARACIÓN</h3>
        <p><strong>Fecha:</strong> ${p.fecha}</p>
        <p><strong>Vehículo Patente:</strong> ${p.patente}</p>
        <p><strong>Detalle del Trabajo:</strong> ${p.detalle}</p>
        <hr style="border:1px solid #000">
        <p><strong>Costo Repuestos:</strong> $${p.repuestosMonto}</p>
        <p><strong>Costo Mano de Obra:</strong> $${p.manoObraMonto}</p>
        <h2 style="color:#000;">TOTAL ESTIMADO: $${p.total}</h2>
    `;
    window.print();
}

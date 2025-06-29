let modoEditor = false;
let miembros = [];

document.addEventListener("DOMContentLoaded", () => {
  const guardados = localStorage.getItem("miembros");
  if (guardados) {
    miembros = JSON.parse(guardados);
  }
});

function guardarEnLocalStorage() {
  localStorage.setItem("miembros", JSON.stringify(miembros));
}

function verificarPassword() {
  const pass = document.getElementById("password").value;
  if (pass === "sodimac") {
    modoEditor = true;
    mostrarControles();
  } else if (pass === "plazanorte") {
    modoEditor = false;
    mostrarControles();
  } else {
    alert("Contraseña incorrecta");
  }
}

function mostrarControles() {
  document.getElementById("login").style.display = "none";
  document.getElementById("contenedorHorario").style.display = "block";
  renderizarMiembros();
}

function agregarMiembro() {
  const input = document.getElementById("nuevoNombre");
  const nombre = input.value.trim();
  if (nombre === "") return;

  miembros.push(nombre);
  miembros.sort((a, b) => a.localeCompare(b));
  guardarEnLocalStorage();
  input.value = "";
  renderizarMiembros();
}

function eliminarMiembro(nombre) {
  miembros = miembros.filter(n => n !== nombre);
  guardarEnLocalStorage();
  renderizarMiembros();
}

function filtrarMiembros() {
  const filtro = document.getElementById("busqueda").value.toLowerCase();
  const contenedor = document.getElementById("listaMiembros");
  Array.from(contenedor.children).forEach(div => {
    const nombre = div.dataset.nombre.toLowerCase();
    div.style.display = nombre.includes(filtro) ? "block" : "none";
  });
}

function renderizarMiembros() {
  const contenedor = document.getElementById("listaMiembros");
  contenedor.innerHTML = "";

  miembros.forEach(nombre => {
    const div = document.createElement("div");
    div.className = "trabajador";
    div.dataset.nombre = nombre;

    const titulo = document.createElement("div");
    titulo.className = "tituloTrabajador";
    titulo.innerHTML = `
      <span>${nombre.toUpperCase()}</span>
      ${modoEditor ? `<button onclick="eliminarMiembro('${nombre}')">Eliminar</button>` : ""}
    `;

    const tabla = crearTablaHorario();
    div.appendChild(titulo);
    div.appendChild(tabla);
    contenedor.appendChild(div);
  });
}

function crearTablaHorario() {
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const turnos = ["Entrada", "Salida", "Refrigerio", "Capacitación"];

  const tabla = document.createElement("table");
  tabla.className = "tablaHorario";

  const thead = document.createElement("thead");
  const filaDias = document.createElement("tr");
  dias.forEach(dia => {
    const th = document.createElement("th");
    th.innerHTML = `${dia}<br><input type="text" class="fecha" placeholder="dd/mm">`;
    filaDias.appendChild(th);
  });
  thead.appendChild(filaDias);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");
  turnos.forEach(() => {
    const fila = document.createElement("tr");
    for (let i = 0; i < dias.length; i++) {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.type = "text";
      input.disabled = !modoEditor;

      input.addEventListener("input", () => {
        const valor = input.value.toLowerCase();
        td.classList.toggle("destacado", valor.includes("vacaciones") || valor.includes("libre"));
      });

      td.appendChild(input);
      fila.appendChild(td);
    }
    tbody.appendChild(fila);
  });

  tabla.appendChild(tbody);
  return tabla;
}

function cerrarSesion() {
  document.getElementById("contenedorHorario").style.display = "none";
  document.getElementById("login").style.display = "block";
  document.getElementById("password").value = "";
  document.getElementById("nuevoNombre").value = "";
  document.getElementById("busqueda").value = "";
}

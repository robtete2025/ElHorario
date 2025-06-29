let modoEditor = false;

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("login").style.display = "block";
});

function crearHorarioVacio() {
  return Array.from({ length: 4 }, () => Array(7).fill(""));
}

async function mostrarControles() {
  document.getElementById("login").style.display = "none";
  document.getElementById("contenedorHorario").style.display = "block";
  await renderizarMiembros();
}

window.verificarPassword = async function () {
  const pass = document.getElementById("password").value;
  if (pass === "sodimac") {
    modoEditor = true;
    await mostrarControles();
  } else if (pass === "plazanorte") {
    modoEditor = false;
    await mostrarControles();
  } else {
    alert("Contraseña incorrecta");
  }
};

window.agregarMiembro = async function () {
  const input = document.getElementById("nuevoNombre");
  const nombre = input.value.trim();
  if (!nombre) return;

  const horarioVacio = crearHorarioVacio();
  await db.collection("trabajadores").doc(nombre).set({
    nombre: nombre,
    horario: horarioVacio
  });

  input.value = "";
  await renderizarMiembros();
};

window.eliminarMiembro = async function (nombre) {
  await db.collection("trabajadores").doc(nombre).delete();
  await renderizarMiembros();
};

window.filtrarMiembros = function () {
  const filtro = document.getElementById("busqueda").value.toLowerCase();
  const contenedor = document.getElementById("listaMiembros");
  Array.from(contenedor.children).forEach(div => {
    const nombre = div.dataset.nombre.toLowerCase();
    div.style.display = nombre.includes(filtro) ? "block" : "none";
  });
};

async function renderizarMiembros() {
  const contenedor = document.getElementById("listaMiembros");
  contenedor.innerHTML = "";

  const snapshot = await db.collection("trabajadores").get();
  const trabajadores = [];

  snapshot.forEach(doc => trabajadores.push(doc.data()));
  trabajadores.sort((a, b) => a.nombre.localeCompare(b.nombre));

  trabajadores.forEach(trabajador => {
    const div = document.createElement("div");
    div.className = "trabajador";
    div.dataset.nombre = trabajador.nombre;

    const titulo = document.createElement("div");
    titulo.className = "tituloTrabajador";
    titulo.innerHTML = `
      <span>${trabajador.nombre.toUpperCase()}</span>
      ${modoEditor ? `<button onclick="eliminarMiembro('${trabajador.nombre}')">Eliminar</button>` : ""}
    `;

    const tabla = crearTablaHorario(trabajador.nombre, trabajador.horario);
    div.appendChild(titulo);
    div.appendChild(tabla);
    contenedor.appendChild(div);
  });
}

function crearTablaHorario(nombre, horario) {
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const tabla = document.createElement("table");
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

  for (let fila = 0; fila < 4; fila++) {
    const tr = document.createElement("tr");
    for (let col = 0; col < 7; col++) {
      const td = document.createElement("td");
      const input = document.createElement("input");
      input.type = "text";
      input.value = horario?.[fila]?.[col] || "";
      input.disabled = !modoEditor;

      if (input.value.toLowerCase().includes("vacaciones") || input.value.toLowerCase().includes("libre")) {
        td.classList.add("destacado");
      }

      input.addEventListener("input", async () => {
        horario[fila][col] = input.value;
        td.classList.toggle("destacado", input.value.toLowerCase().includes("vacaciones") || input.value.toLowerCase().includes("libre"));

        await db.collection("trabajadores").doc(nombre).set({
          nombre: nombre,
          horario: horario
        });
      });

      td.appendChild(input);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }

  tabla.appendChild(tbody);
  return tabla;
}

window.cerrarSesion = function () {
  document.getElementById("contenedorHorario").style.display = "none";
  document.getElementById("login").style.display = "block";
  document.getElementById("password").value = "";
  document.getElementById("nuevoNombre").value = "";
  document.getElementById("busqueda").value = "";
};

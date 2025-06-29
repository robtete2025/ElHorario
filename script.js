import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getFirestore, collection, doc, getDocs, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Configuración de tu Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD3XtGXXs-HtrUsXirEdn0o-ze_xuD4kJs",
  authDomain: "sodimacplanor.firebaseapp.com",
  projectId: "sodimacplanor",
  storageBucket: "sodimacplanor.firebasestorage.app",
  messagingSenderId: "1014260848696",
  appId: "1:1014260848696:web:1aaa749e5a1cc272912ecd",
  measurementId: "G-HY90ZJVJQ5"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let modoEditor = false;

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("login").style.display = "block";
});

// Verificar contraseña y mostrar interfaz
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

async function mostrarControles() {
  document.getElementById("login").style.display = "none";
  document.getElementById("contenedorHorario").style.display = "block";
  await renderizarMiembros();
}

// Agregar trabajador
window.agregarMiembro = async function () {
  const input = document.getElementById("nuevoNombre");
  const nombre = input.value.trim();
  if (nombre === "") return;

  const horarioVacio = Array.from({ length: 4 }, () => Array(7).fill(""));
  await setDoc(doc(db, "trabajadores", nombre), {
    nombre: nombre,
    horario: horarioVacio
  });

  input.value = "";
  await renderizarMiembros();
};

// Eliminar trabajador
window.eliminarMiembro = async function (nombre) {
  await deleteDoc(doc(db, "trabajadores", nombre));
  await renderizarMiembros();
};

// Buscar trabajadores
window.filtrarMiembros = function () {
  const filtro = document.getElementById("busqueda").value.toLowerCase();
  const contenedor = document.getElementById("listaMiembros");
  Array.from(contenedor.children).forEach(div => {
    const nombre = div.dataset.nombre.toLowerCase();
    div.style.display = nombre.includes(filtro) ? "block" : "none";
  });
};

// Renderizar todos los trabajadores
async function renderizarMiembros() {
  const contenedor = document.getElementById("listaMiembros");
  contenedor.innerHTML = "";

  const querySnapshot = await getDocs(collection(db, "trabajadores"));
  const trabajadores = [];

  querySnapshot.forEach(doc => {
    trabajadores.push(doc.data());
  });

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

// Crear tabla por trabajador
function crearTablaHorario(nombre, horario) {
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
  const turnos = ["Entrada", "Salida", "Refrigerio", "Capacitación"];
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
        await setDoc(doc(db, "trabajadores", nombre), {
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

// Cerrar sesión
window.cerrarSesion = function () {
  document.getElementById("contenedorHorario").style.display = "none";
  document.getElementById("login").style.display = "block";
  document.getElementById("password").value = "";
  document.getElementById("nuevoNombre").value = "";
  document.getElementById("busqueda").value = "";
};

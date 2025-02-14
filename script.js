let alumnos = [];
let fileHandle = null;
const form = document.getElementById("alumnoForm");
const tabla = document.getElementById("alumnosTable").getElementsByTagName("tbody")[0];

// Evento para cargar el archivo CSV al hacer clic en el botón
document.getElementById('cargarCSV').addEventListener('click', cargarCSV);

// Función para obtener un archivo CSV
async function obtenerArchivoCSV() {
    try {
        [fileHandle] = await window.showOpenFilePicker({
            types: [{
                description: 'CSV Files',
                accept: {
                    'text/csv': ['.csv'],
                }
            }],
            createNew: true
        });
        return fileHandle;
    } catch (error) {
        console.error('Error al obtener el archivo:', error);
        alert('No se pudo acceder al archivo CSV. Asegúrese de dar los permisos necesarios.');
    }
}

// Función para cargar y parsear el archivo CSV
async function cargarCSV() {
    try {
        if (!fileHandle) {
            fileHandle = await obtenerArchivoCSV();
        }

        const file = await fileHandle.getFile();
        const texto = await file.text();
        
        const results = Papa.parse(texto, {
            header: true,
            skipEmptyLines: true
        });
        
        alumnos = results.data;
        actualizarTabla();
    } catch (error) {
        console.error('Error al cargar el CSV:', error);
        alumnos = [];
        actualizarTabla();
    }
}

// Función para guardar los datos en el archivo CSV
async function guardarCSV(alumnos) {
    try {
        if (!fileHandle) {
            fileHandle = await obtenerArchivoCSV();
        }

        const csv = Papa.unparse(alumnos);
        
        const writable = await fileHandle.createWritable();
        await writable.write(csv);
        await writable.close();
        
        console.log('Archivo guardado exitosamente');
    } catch (error) {
        console.error('Error al guardar el CSV:', error);
        alert('Error al guardar los datos. Por favor, intente nuevamente.');
    }
}

// Evento para guardar un alumno al enviar el formulario
form.addEventListener("submit", (e) => {
    e.preventDefault();
    guardarAlumno();
});

// Función para guardar o actualizar un alumno
async function guardarAlumno() {
    const alumno = {
        id: document.getElementById("alumnoId").value || Date.now().toString(),
        nombre: document.getElementById("nombre").value,
        apellido: document.getElementById("apellido").value,
        email: document.getElementById("email").value,
        carrera: document.getElementById("carrera").value,
    };

    const index = alumnos.findIndex((a) => a.id === alumno.id);
    if (index > -1) {
        alumnos[index] = alumno;
    } else {
        alumnos.push(alumno);
    }

    await guardarCSV(alumnos);
    actualizarTabla();
    form.reset();
    document.getElementById("alumnoId").value = "";
}

// Función para actualizar la tabla con los datos de los alumnos
function actualizarTabla() {
    tabla.innerHTML = "";
    alumnos.forEach((alumno) => {
        const row = tabla.insertRow();
        row.innerHTML = `
            <td>${alumno.nombre}</td>
            <td>${alumno.apellido}</td>
            <td>${alumno.email}</td>
            <td>${alumno.carrera}</td>
            <td>
                <button class="btn-editar" onclick="editarAlumno('${alumno.id}')">Editar</button>
                <button class="btn-eliminar" onclick="eliminarAlumno('${alumno.id}')">Inhabilitar</button>
            </td>
        `;
    });
}

// Función para editar un alumno
function editarAlumno(id) {
    const alumno = alumnos.find((a) => a.id === id);
    if (alumno) {
        document.getElementById("alumnoId").value = alumno.id;
        document.getElementById("nombre").value = alumno.nombre;
        document.getElementById("apellido").value = alumno.apellido;
        document.getElementById("email").value = alumno.email;
        document.getElementById("carrera").value = alumno.carrera;
    }
}

// Función para eliminar un alumno
async function eliminarAlumno(id) {
    if (confirm("¿Está seguro de que desea inhabilitar a este alumno?")) {
        alumnos = alumnos.filter((a) => a.id !== id);
        await guardarCSV(alumnos);
        actualizarTabla();
    }
}
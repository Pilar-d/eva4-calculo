let graficoFila;

// Función matemática del proyecto:
// T(x) = 0,05x² + 0,5x
function calcularTiempoEspera(x) {
  return 0.05 * Math.pow(x, 2) + 0.5 * x;
}

// Derivada:
// T'(x) = 0,1x + 0,5
function calcularDerivada(x) {
  return 0.1 * x + 0.5;
}

function calcularEspera() {
  const usuariosInput = document.getElementById("usuarios");
  const tiempoTexto = document.getElementById("tiempo");
  const estadoTexto = document.getElementById("estado");
  const recomendacionTexto = document.getElementById("recomendacion");

  const usuarios = Number(usuariosInput.value);

  if (usuariosInput.value === "" || usuarios < 0) {
    tiempoTexto.textContent = "-- minutos";
    estadoTexto.textContent = "Ingrese un valor válido";
    estadoTexto.className = "";
    recomendacionTexto.textContent =
      "Debe ingresar una cantidad de usuarios igual o mayor a 0.";
    return;
  }

  const tiempo = calcularTiempoEspera(usuarios);
  const derivada = calcularDerivada(usuarios);

  tiempoTexto.textContent = `${tiempo.toFixed(1)} minutos`;

  // Clasificación del sistema según el tiempo estimado:
  // Normal: menos de 15 minutos
  // Medio: entre 15 y 45 minutos
  // Saturado: más de 45 minutos
  if (tiempo < 15) {
    estadoTexto.textContent = "Normal";
    estadoTexto.className = "normal";
    recomendacionTexto.textContent =
      `El sistema se mantiene estable. La espera aumenta aproximadamente ${derivada.toFixed(1)} minutos por cada nuevo usuario.`;
  } else if (tiempo < 45) {
    estadoTexto.textContent = "Medio";
    estadoTexto.className = "medio";
    recomendacionTexto.textContent =
      `La espera comienza a aumentar. Se recomienda monitorear la fila y mejorar el flujo de atención. La derivada es ${derivada.toFixed(1)}.`;
  } else {
    estadoTexto.textContent = "Saturado";
    estadoTexto.className = "saturado";
    recomendacionTexto.textContent =
      `El sistema presenta alta espera. Se recomienda aumentar la capacidad de atención o dividir la fila. La derivada es ${derivada.toFixed(1)}.`;
  }

  actualizarGrafico(usuarios);
}

function crearDatosGrafico(maxUsuarios) {
  const limite = Math.max(60, maxUsuarios + 10);
  const etiquetas = [];
  const datosTiempo = [];
  const datosDerivada = [];

  for (let x = 0; x <= limite; x += 5) {
    etiquetas.push(x);
    datosTiempo.push(calcularTiempoEspera(x));
    datosDerivada.push(calcularDerivada(x));
  }

  return { etiquetas, datosTiempo, datosDerivada };
}

function actualizarGrafico(usuariosSeleccionados = 60) {
  const ctx = document.getElementById("grafico").getContext("2d");
  const datos = crearDatosGrafico(usuariosSeleccionados);

  if (graficoFila) {
    graficoFila.destroy();
  }

  graficoFila = new Chart(ctx, {
    type: "line",
    data: {
      labels: datos.etiquetas,
      datasets: [
        {
          label: "T(x): Tiempo estimado de espera",
          data: datos.datosTiempo,
          borderWidth: 3,
          tension: 0.35
        },
        {
          label: "T'(x): Aumento del tiempo de espera",
          data: datos.datosDerivada,
          borderWidth: 3,
          tension: 0.35
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#4a3508",
            font: {
              size: 13,
              weight: "bold"
            }
          }
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.dataset.label}: ${context.parsed.y.toFixed(1)}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Cantidad de usuarios",
            color: "#4a3508",
            font: {
              size: 14,
              weight: "bold"
            }
          },
          ticks: {
            color: "#4a3508"
          },
          grid: {
            color: "rgba(74, 53, 8, 0.12)"
          }
        },
        y: {
          title: {
            display: true,
            text: "Tiempo estimado y aumento de espera",
            color: "#4a3508",
            font: {
              size: 14,
              weight: "bold"
            }
          },
          ticks: {
            color: "#4a3508"
          },
          grid: {
            color: "rgba(74, 53, 8, 0.12)"
          }
        }
      }
    }
  });
}

// Crear gráfico inicial al cargar la página
document.addEventListener("DOMContentLoaded", function () {
  actualizarGrafico(60);
});
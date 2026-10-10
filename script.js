
"use strict";

/* ==========================================
   1. ELEMENTOS DE LA INTERFAZ
========================================== */

const pantallaResultado = document.getElementById("resultado");
const pantallaOperacion = document.getElementById("operacion");
const teclado = document.querySelector(".teclado");
const botonesOperadores = document.querySelectorAll("[data-operador]");

/* ==========================================
   2. ESTADO DE LA CALCULADORA
========================================== */

let numeroActual = "0";
let numeroAnterior = null;
let operadorActual = null;
let esperandoSegundoNumero = false;
let resultadoMostrado = false;
let mensajeError = false;

const MAX_DIGITOS = 14;

/* ==========================================
   3. FUNCIONES DE PRESENTACIÓN
========================================== */

function formatearNumero(valor) {
    if (valor === "Error") {
        return valor;
    }

    const numero = Number(valor);

    if (!Number.isFinite(numero)) {
        return "Error";
    }

    // Mantener visible el punto decimal mientras se escribe.
    if (typeof valor === "string" && valor.endsWith(".")) {
        return formatearNumero(valor.slice(0, -1)) + ".";
    }

    const formato = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 10,
        useGrouping: true
    });

    return formato.format(numero);
}

function simboloOperador(operador) {
    const simbolos = {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷"
    };

    return simbolos[operador] || operador;
}

function actualizarPantalla() {
    pantallaResultado.textContent = mensajeError
        ? "Error"
        : formatearNumero(numeroActual);

    if (operadorActual !== null && numeroAnterior !== null) {
        pantallaOperacion.textContent =
            formatearNumero(numeroAnterior) +
            " " +
            simboloOperador(operadorActual);
    } else if (!resultadoMostrado) {
        pantallaOperacion.textContent = "\u00A0";
    }

    // Resaltar el operador seleccionado.
    botonesOperadores.forEach((boton) => {
        const activo =
            boton.dataset.operador === operadorActual &&
            esperandoSegundoNumero;

        boton.classList.toggle("activo", activo);
        boton.setAttribute("aria-pressed", String(activo));
    });
}

/* ==========================================
   4. INGRESO DE NÚMEROS
========================================== */

function ingresarNumero(digito) {
    if (mensajeError) {
        limpiarCalculadora();
    }

    if (esperandoSegundoNumero) {
        numeroActual = digito;
        esperandoSegundoNumero = false;
        resultadoMostrado = false;
    } else if (resultadoMostrado) {
        numeroActual = digito;
        numeroAnterior = null;
        operadorActual = null;
        resultadoMostrado = false;
        pantallaOperacion.textContent = "\u00A0";
    } else {
        const cantidadDigitos = numeroActual.replace(/[^0-9]/g, "").length;

        if (cantidadDigitos >= MAX_DIGITOS) {
            return;
        }

        numeroActual = numeroActual === "0"
            ? digito
            : numeroActual + digito;
    }

    actualizarPantalla();
}

/* ==========================================
   5. NÚMEROS DECIMALES
========================================== */

function ingresarDecimal() {
    if (mensajeError) {
        limpiarCalculadora();
    }

    if (esperandoSegundoNumero || resultadoMostrado) {
        if (resultadoMostrado) {
            numeroAnterior = null;
            operadorActual = null;
            pantallaOperacion.textContent = "\u00A0";
        }

        numeroActual = "0.";
        esperandoSegundoNumero = false;
        resultadoMostrado = false;
    } else if (!numeroActual.includes(".")) {
        numeroActual += ".";
    }

    actualizarPantalla();
}

/* ==========================================
   6. OPERACIONES MATEMÁTICAS
========================================== */

function calcular(a, b, operador) {
    let resultado;

    switch (operador) {
        case "+":
            resultado = a + b;
            break;

        case "-":
            resultado = a - b;
            break;

        case "*":
            resultado = a * b;
            break;

        case "/":
            if (b === 0) {
                return null;
            }

            resultado = a / b;
            break;

        default:
            return null;
    }

    if (!Number.isFinite(resultado)) {
        return null;
    }

    // Reducir errores habituales de precisión decimal.
    return Number(resultado.toPrecision(12));
}

function mostrarError() {
    mensajeError = true;
    numeroActual = "Error";
    numeroAnterior = null;
    operadorActual = null;
    esperandoSegundoNumero = false;
    resultadoMostrado = false;

    pantallaOperacion.textContent = "Operación no válida";
    actualizarPantalla();
}

function seleccionarOperador(operador) {
    if (mensajeError) {
        return;
    }

    const valorActual = Number(numeroActual);

    if (operadorActual !== null && esperandoSegundoNumero) {
        operadorActual = operador;
        actualizarPantalla();
        return;
    }

    if (numeroAnterior === null) {
        numeroAnterior = valorActual;
    } else if (operadorActual !== null) {
        const resultado = calcular(
            numeroAnterior,
            valorActual,
            operadorActual
        );

        if (resultado === null) {
            mostrarError();
            return;
        }

        numeroAnterior = resultado;
        numeroActual = String(resultado);
    }

    operadorActual = operador;
    esperandoSegundoNumero = true;
    resultadoMostrado = false;

    actualizarPantalla();
}

function obtenerResultado() {
    if (
        mensajeError ||
        operadorActual === null ||
        numeroAnterior === null ||
        esperandoSegundoNumero
    ) {
        return;
    }

    const primerNumero = numeroAnterior;
    const segundoNumero = Number(numeroActual);
    const operador = operadorActual;

    const resultado = calcular(
        primerNumero,
        segundoNumero,
        operador
    );

    if (resultado === null) {
        mostrarError();
        return;
    }

    pantallaOperacion.textContent =
        formatearNumero(primerNumero) +
        " " +
        simboloOperador(operador) +
        " " +
        formatearNumero(segundoNumero) +
        " =";

    numeroActual = String(resultado);
    numeroAnterior = null;
    operadorActual = null;
    esperandoSegundoNumero = false;
    resultadoMostrado = true;

    actualizarPantalla();
}

/* ==========================================
   7. FUNCIONES ADICIONALES
========================================== */

function limpiarCalculadora() {
    numeroActual = "0";
    numeroAnterior = null;
    operadorActual = null;
    esperandoSegundoNumero = false;
    resultadoMostrado = false;
    mensajeError = false;

    pantallaOperacion.textContent = "\u00A0";
    actualizarPantalla();
}

function borrarUltimoDigito() {
    if (mensajeError) {
        limpiarCalculadora();
        return;
    }

    if (esperandoSegundoNumero) {
        return;
    }

    if (resultadoMostrado) {
        resultadoMostrado = false;
        pantallaOperacion.textContent = "\u00A0";
    }

    if (numeroActual.length <= 1 ||
        (numeroActual.length === 2 && numeroActual.startsWith("-"))) {
        numeroActual = "0";
    } else {
        numeroActual = numeroActual.slice(0, -1);
    }

    actualizarPantalla();
}

function cambiarSigno() {
    if (mensajeError || esperandoSegundoNumero) {
        return;
    }

    if (Number(numeroActual) === 0) {
        return;
    }

    numeroActual = numeroActual.startsWith("-")
        ? numeroActual.slice(1)
        : "-" + numeroActual;

    actualizarPantalla();
}

function calcularPorcentaje() {
    if (mensajeError || esperandoSegundoNumero) {
        return;
    }

    const resultado = Number(numeroActual) / 100;

    numeroActual = String(Number(resultado.toPrecision(12)));

    actualizarPantalla();
}

/* ==========================================
   8. CONTROL DE LOS BOTONES
========================================== */

function ejecutarAccion(accion) {
    switch (accion) {
        case "limpiar":
            limpiarCalculadora();
            break;

        case "borrar":
            borrarUltimoDigito();
            break;

        case "decimal":
            ingresarDecimal();
            break;

        case "signo":
            cambiarSigno();
            break;

        case "porcentaje":
            calcularPorcentaje();
            break;

        case "igual":
            obtenerResultado();
            break;
    }
}

teclado.addEventListener("click", (evento) => {
    const boton = evento.target.closest("button");

    if (!boton || !teclado.contains(boton)) {
        return;
    }

    if (boton.dataset.numero !== undefined) {
        ingresarNumero(boton.dataset.numero);
        return;
    }

    if (boton.dataset.operador !== undefined) {
        seleccionarOperador(boton.dataset.operador);
        return;
    }

    if (boton.dataset.accion !== undefined) {
        ejecutarAccion(boton.dataset.accion);
    }
});

/* ==========================================
   9. SOPORTE PARA TECLADO
========================================== */

document.addEventListener("keydown", (evento) => {
    const tecla = evento.key;

    if (/^[0-9]$/.test(tecla)) {
        ingresarNumero(tecla);
        return;
    }

    if (["+", "-", "*", "/"].includes(tecla)) {
        evento.preventDefault();
        seleccionarOperador(tecla);
        return;
    }

    switch (tecla) {
        case ".":
        case ",":
            ingresarDecimal();
            break;

        case "Enter":
        case "=":
            evento.preventDefault();
            obtenerResultado();
            break;

        case "Escape":
            limpiarCalculadora();
            break;

        case "Backspace":
            evento.preventDefault();
            borrarUltimoDigito();
            break;

        case "%":
            calcularPorcentaje();
            break;
    }
});

/* ==========================================
   10. INICIALIZACIÓN
========================================== */

actualizarPantalla();

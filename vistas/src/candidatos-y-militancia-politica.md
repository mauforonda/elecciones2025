---
title: Candidatos y militancia política
---

<link rel="stylesheet" href="style.css">

```js
// detect dark theme to adjust some colors
const dark = Generators.observe((notify) => {
  const mql = window.matchMedia("(prefers-color-scheme: dark)");
  const update = () => notify(mql.matches);

  update(); // initial value
  mql.addEventListener("change", update);

  return () => mql.removeEventListener("change", update);
});
```

```js
// Algunas constantes
const colors = {
  frame: dark ? "#b2b7baff" : "#39484d",
  highlight: dark ? "#ffffffff" : "#116379ff",
};
const sinMilitancia = "Ninguno";
const mas =
  "MOVIMIENTO AL SOCIALISMO INSTRUMENTO POLITICO POR LA SOBERANIA DE LOS PUEBLOS";
const mas_listas =
  "MOVIMIENTO AL SOCIALISMO INSTRUMENTO POLITICO POR LA SOBERANIA DE LOS PUEBLOS (MAS-IPSP)";
```

```js
// Dependencias
import {
  candidatos,
  mensajeNingunos,
  mensajeMilitancias,
  displayCandidato,
} from "./components/candidatos.js";
import { aggregate_sort } from "./components/process.js";
import { format } from "npm:d3";
```

```js
// Valores únicos
const opciones = Object.fromEntries(
  [
    "candidatura_listas",
    "partido_listas",
    "departamento_listas",
    "genero_listas",
    "partido_padron",
  ].map((i) => [i, Array.from(new Set(candidatos.map((c) => c[i])))])
);
```

```js
// Menú de tipos de candidaturas
const candidatura_listas_input = Inputs.select(
  [...["Todas"], ...opciones.candidatura_listas],
  {
    label: "Candidatura",
  }
);
const candidatura_listas = Generators.input(candidatura_listas_input);
```

```js
// Filtro para la vista de candidatos en detalle
const filtered = candidatos.filter(
  (c) =>
    (candidatura_listas != "Todas"
      ? c.candidatura_listas == candidatura_listas
      : candidatura_listas) && c.partido_padron == partido
);
```

```js
// Conteo de candidatos por partidos de militancia
const militancias_completo = aggregate_sort(candidatos, "partido_padron");
const militancias = aggregate_sort(
  candidatos.filter((c) => c.partido_padron != sinMilitancia),
  "partido_padron"
);
```

```js
// Valores para mensajes de reporte
const keyValues = {
  candidatos_count: candidatos.length,
  militantes_count:
    candidatos.length - militancias_completo.keys[sinMilitancia].count,
  militantes_percent: 1 - militancias_completo.keys[sinMilitancia].percent,
  mas_count: militancias.keys[mas].count,
  mas_percent: militancias.keys[mas].percent,
  mas_outside: candidatos.filter(
    (c) => c.partido_padron == mas && c.partido_listas != mas_listas
  ).length,
};
```

```js
// Gráfico de militancias, incluyendo candidatos sin militancia
const plotNingunaMilitancia = Plot.plot({
  title: "Número de candidatos por militancia",
  subtitle: "incluyendo aquellos sin militancia",
  marginBottom: 5,
  height: 30,
  width: width,
  x: {
    axis: null,
  },
  y: {
    axis: null,
  },
  style: {
    color: colors.frame,
  },
  marks: [
    Plot.barX(militancias_completo.array, {
      x: "count",
      fillOpacity: (d) => (d.partido_padron == sinMilitancia ? 0.1 : 0.5),
      inset: 1,
    }),
    Plot.barX([militancias_completo.keys[sinMilitancia]], {
      x: "count",
      fillOpacity: 0.1,
      inset: 1,
      insetBottom: -20,
      insetTop: 27,
    }),
    Plot.barX(
      militancias_completo.array,
      Plot.pointerX({
        x: "count",
        fillOpacity: (d) => (d.partido_padron == sinMilitancia ? 0 : 0.5),
        inset: 1,
        insetBottom: -20,
        insetTop: 27,
      })
    ),
    Plot.text([militancias_completo.keys.Ninguno], {
      text: (d) => "sin militancia",
      x: 0,
      textAnchor: "start",
      dx: 8,
      fillOpacity: 0.7,
    }),
  ],
});
const plotNingunaMilitancia_value = Generators.input(plotNingunaMilitancia);
```

```js
// Gráfico de militancias, sólo con candidatos militantes
const plotMilitancias = Plot.plot({
  title: "Número de candidatos por militancia",
  subtitle: "entre sólo aquellos que declaran alguna militancia",
  marginBottom: 5,
  height: 30,
  width: width,
  x: {
    axis: null,
  },
  y: {
    axis: null,
  },
  style: {
    color: colors.frame,
  },
  marks: [
    Plot.barX(militancias.array, {
      x: "count",
      fillOpacity: 0.5,
      inset: 1,
    }),
    Plot.barX([militancias.keys[mas]], {
      x: "count",
      fill: colors.highlight,
      fillOpacity: 0.2,
      inset: 1,
      insetBottom: -20,
      insetTop: 27,
    }),
    Plot.barX(
      militancias.array,
      Plot.pointerX({
        x: "count",
        fill: colors.highlight,
        fillOpacity: (d) => (d.partido_padron == mas ? 0 : 0.5),
        inset: 1,
        insetBottom: -20,
        insetTop: 27,
      })
    ),
  ],
});
const plotMilitancias_value = Generators.input(plotMilitancias);
```

```js
// Partido de militancia seleccionado
const partido = plotMilitancias_value
  ? plotMilitancias_value.partido_padron
  : mas;
```

```js
// Gráfico de cada candidato en detalle
const plotDetalle = Plot.plot({
  title: "Cada candidato en carrera",
  subtitle: "según el partido por el que postula",
  margin: 0,
  height: 500,
  width: width,
  x: {
    axis: null,
  },
  y: {
    axis: null,
  },
  style: {
    color: colors.frame,
  },
  marks: [
    Plot.axisY({
      textAnchor: "start",
      lineAnchor: "bottom",
      label: null,
      fillOpacity: 0.8,
      tickSize: 0,
      fontWeight: "normal",
      dx: 8,
      dy: -7,
    }),
    Plot.tickX(candidatos, {
      filter: (c) => !filtered.includes(c),
      x: "i",
      y: "partido_listas",
      strokeOpacity: 0.5,
      insetTop: 25,
      insetBottom: 0,
      sort: {
        y: "x",
        reverse: true,
      },
    }),
    Plot.tickX(filtered, {
      x: "i",
      y: "partido_listas",
      stroke: colors.highlight,
      strokeOpacity: 0.6,
      strokeWidth: 1.5,
      insetTop: 24,
      insetBottom: -1,
      sort: {
        y: "x",
        reverse: true,
      },
    }),
    Plot.tickX(
      filtered,
      Plot.pointer({
        x: "i",
        y: "partido_listas",
        stroke: colors.highlight,
        strokeWidth: 1.5,
        strokeOpacity: 1,
        insetTop: 24,
        insetBottom: -1,
        sort: {
          y: "x",
          reverse: true,
        },
      })
    ),
  ],
});

const selection = Generators.input(plotDetalle);
```

# Candidatos y militancia política

## Con información actualizada del padrón electoral

Una expresión de la actual crisis de representación política es la poca relación entre los partidos con los que candidatos electorales postulan y aquellos donde dicen militar.

De ${keyValues.candidatos_count} candidatos a las elecciones generales 2025, sólo ${keyValues.militantes_count} (${format(".2%")(keyValues.militantes_percent)}) están inscritos como militantes de algún partido.

<div class="card grafico ninguna_militancia">
  ${plotNingunaMilitancia}
  <p class="mensaje">
    ${mensajeNingunos(plotNingunaMilitancia_value, militancias_completo.keys.Ninguno, sinMilitancia)}
  </p>
</div>

Y entre ellos, ${keyValues.mas_count} (${format(".2%")(keyValues.mas_percent)}) son militantes del MAS-IPSP, incluyendo a ${keyValues.mas_outside} que ahora postulan bajo otros partidos.

<div class="card grafico militancias">
  ${plotMilitancias}
  <p class="mensaje">
    ${mensajeMilitancias(plotMilitancias_value, militancias.keys[mas])}
  </p>
</div>

Quiénes son y dónde postulan?

<div class="menu">
  ${candidatura_listas_input}
</div>

<div class="card grafico detalle">
    ${plotDetalle}
</div>

${displayCandidato(selection)}

<div class="footer">
  Puedes descargar los datos y consultar cómo exactamente fueron producidos en el <a href="https://github.com/mauforonda/elecciones2025">repositorio en github</a>. Éste es un proyecto de <a href="https://mauforonda.github.io">Mauricio Foronda</a>.
</div>

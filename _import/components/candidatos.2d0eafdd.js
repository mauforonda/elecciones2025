import { getParquet } from "./load.5d28e15d.js";
import { format } from "../../_npm/d3@7.9.0/e780feca.js";
import { html } from "../../_npm/htl@0.3.1/72f4716c.js";

export const candidatos = (async () => {
  const padron = await getParquet(
    "candidaturas/datos/yoparticipo.parquet",
    "padron"
  );
  const listas = await getParquet("candidaturas/datos/2025.parquet", "listas");
  let consolidado = listas.map((a) => {
    const match = padron.find(
      (b) => a.nro_documento_listas === b.nro_documento_padron
    );
    return match ? { ...a, ...match } : a;
  });
  return consolidado.map(
    ((c) => {
      const counts = {};
      return (c) => {
        const k = c.partido_listas;
        counts[k] = (counts[k] || 0) + 1;
        return {
          ...c,
          i: counts[k],
          partido_padron: c.partido_padron ?? "Ninguno",
        };
      };
    })()
  );
})();

export function mensajeNingunos(selection, ningunos, sinMilitancia) {
  const amounts = (i) => {
    return `${i.count} candidatos (${format(".2%")(
      i.percent
    )} de todos los candidatos)`;
  };
  const ninguno = `${amounts(ningunos)} sin militancia`;
  if (selection) {
    if (selection.partido_padron != sinMilitancia) {
      return `${amounts(selection)} registrados en ${selection.partido_padron}`;
    } else {
      return ninguno;
    }
  } else {
    return ninguno;
  }
}

export function mensajeMilitancias(selection, default_values) {
  const amounts = (i) => {
    return `${i.count} candidatos (${format(".2%")(
      i.percent
    )} de los candidatos militantes)`;
  };
  const default_message = `${amounts(default_values)} registrados en ${
    default_values.partido_padron
  }`;
  if (selection) {
    return `${amounts(selection)} registrados en ${selection.partido_padron}`;
  } else {
    return default_message;
  }
}

export function displayCandidato(c) {
  const container = html`<div class="candidato"></div>`;

  if (c) {
    const dateFormatter = new Intl.DateTimeFormat("es", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
    const candidatura_genero = (candidatura, mujer) => {
      return candidatura
        .replace("Diputados", mujer ? "Diputada" : "Diputado")
        .replace("Senadores", mujer ? "Senadora" : "Senador")
        .replace("Representantes", "Representante");
    };
    const mujer = c.genero_listas == "F" ? true : false;

    const edad = Math.floor(
      (new Date() - c.fecha_nacimiento_listas) / (1000 * 60 * 60 * 24 * 365)
    );

    const nombre = html`<div class="nombre">${c.nombre_completo_listas}</div>`;
    const personal = html`<div class="personal">
      ${mujer ? "Mujer nacida" : "Hombre nacido"} el
      ${dateFormatter.format(c.fecha_nacimiento_listas)} (${edad} años)
    </div>`;
    const en_lista = html`<div class="en_lista">
      ${mujer ? "Candidata" : "Candidato"} a
      ${candidatura_genero(c.candidatura_listas, mujer)} en
      ${c.departamento_listas} por
      <span class="partido">${c.partido_listas}</span>
    </div>`;
    const en_padron = html`<div class="en_padron">
      Militante de <span class="partido">${c.partido_padron}</span>
    </div>`;

    [nombre, personal, en_lista, en_padron].forEach((i) => container.append(i));
  }

  return container;
}

import { parquetRead, parquetMetadata } from "../../_npm/hyparquet@1.17.1/bab1c68c.js"

export async function getParquet(filePath, sufijo) {
    const baseURL = "https://raw.githubusercontent.com/mauforonda/elecciones2025/refs/heads/main/"
    const arrayBuffer = await fetch(
        `${baseURL}${filePath}`
    ).then((d) => d.arrayBuffer())
    const data = await new Promise((onComplete) =>
        parquetRead({ file: arrayBuffer, onComplete })
    )
    const metadata = parquetMetadata(arrayBuffer)
    const columns = metadata.schema.filter(i => i.type && !i.name.includes("index_level")).map(i => [i.name, i.logical_type ? i.logical_type.type : null])
    return data.map(row => Object.fromEntries(columns.map((c, i) => [`${c[0]}_${sufijo}`, c[1] == "TIMESTAMP" ? new Date(row[i]) : row[i]])));
}
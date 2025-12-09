export interface IProductImportTemplateRow {
    name: string
    key: string
    title: string
    dataIndex: number

}

export interface IAvailableColumn {
    attribute: string
    column: string
    id: string
    name: string
    relationable_id?: string
    relationable_type?: string
    // disabled?: boolean // este atributo fue agregado en esta interfaz para el dropdown.
}

export interface ISelectedColumn {
    attribute: string
    dataIndex: string | number
    editable: boolean
    option: any
}

export interface ISelectedExportColumn {
    attribute: string
}
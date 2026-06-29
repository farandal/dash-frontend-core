const customEs = {
  
    "Delivery Method": "Método de Entrega",
    "Table Number": "Número de Mesa",
    "Counter": "Mostrador",
    "Table": "Mesa",
    "Delivery": "Entrega",
    tab: {
        attribute: {
            note: "Nota",
            actions: "Acciones",
            created: "Creado",
            delivery_method: "Método de Entrega",
            ingresada: "Ingresada",
            is_paid: "Pagado",
            marketplace_status: "Estado del Marketplace",
            order_summary: "Resumen de la Orden",
            productos: "Productos",
            status: "Estado",
            tab: "Tab",
            table_number: "Número de Mesa",
            total: "Total",
        },
        tab: {
            productos: "Productos",
            comanda: "Comanda",
            marketplace: "Marketplace",
            datos: "Datos",
        },
        tabs: 'Tabs',
        kitchen_tabs: 'Comandas de Cocina',
        action: {
            cancel: 'Cancelar',
            confirm: 'Confirmar',
            print: 'Imprimir',
            pay: 'Pagar',
            close: 'Cerrar',
            confirmed: "Confirmar",
            in_preparation: "Iniciar Preparación",
            prepared: "Preparado",
            delivered: "Entregado",
            closed: "Cerrar",
            close_tab: "Cerrar Tab",
            print_tab: "Imprimir Tab",
            download: "Descargar Tab",
            payment: "Registrar Pago",
        },
        status: {
            created: 'Creado',
            confirmed: 'Confirmado',
            preparing: 'Preparando',
            ready: 'Listo',
            delivered: 'Entregado',
            completed: 'Completado',
            cancelled: 'Cancelado',
            in_preparation: "En Preparación",
            prepared: "Preparado",
            closed: "Cerrado",
            label: "Estado",
            change_to: "Cambiar estado a %{status}",
            error_updating: "Error actualizando estado",
        },
        products: {
            search: {
                label: "Buscar",
                clear: "Limpiar búsqueda",
                local_active: "Búsqueda local activa. Escribe %{count} caracteres más para búsqueda en servidor.",
                server_active: "Búsqueda en servidor activa",
                local_search: "Búsqueda local: %{term}",
                recent_searches: "Búsquedas recientes:",
            },
            cache: {
                cached_results: "Resultados en caché (hace {seconds}s)",
                loading_fresh: "Cargando datos frescos...",
                products_cached: "%{count} productos en caché",
            },
            infinite_scroll: {
                end_of_results: "Fin de los resultados",
                loading_more: "Cargando más productos...",
            },
            no_products_category: "No hay productos en esta categoría",
            loading: "Cargando productos...",
            updating: "Actualizando...",
            display: {
                showing_results: "Mostrando %{displayed} de %{total} resultados",
                showing_results_local: "Mostrando %{displayed} de %{total} resultados (local)",
            },
            buttons: {
                show_more: "Mostrar Más (%{count} restantes)",
                show_less: "Mostrar Menos",
                loading: "Cargando...",
            },
            error: {
                loading_failed: "Error al cargar los productos",
                retry: "Reintentar",
            },
            no_results: "No se encontraron productos para %{term}",
            no_results_hint: "Intenta escribir %{count} caracteres más para buscar en el servidor",
            modifier: {
                dialog: {
                    title: "%{productName} - Seleccionar Opciones",
                    cancel: "Cancelar",
                    add: "Agregar a la Orden",
                },
            },
            message: {
                added: "Producto agregado a la orden",
                created_success: "¡Tab creada exitosamente!",
                error: "Error al actualizar los productos",
            },
            ai_modifiers: "Modificadores sugeridos por IA",
            no_modifiers: "Este producto no tiene modificadores",
            required: "Requerido",
            select_multiple: "Selecciona varias opciones",
        },
        order: {
            no_products: "No hay productos en la orden",
            add_products_hint: "Comienza a agregar productos para crear tu orden",
            products_list: "Productos de la Orden",
            modifiers: "Modificadores",
            note_placeholder: "Agregar una nota para este ítem...",
            quantity: "Cantidad",
            total: "Total",
            summary: "Resumen de la Orden",
            subtotal: "Subtotal:",
            suggested_service: "Servicio sugerido (%{percent}%):",
            currency: "Moneda: %{code} (%{symbol})",
            discount: "Descuento",
            type: "Tipo",
            value: "Valor",
            discount_reason: "Razón del descuento (opcional)",
            discount_reason_placeholder: "Ej: Cortesía del chef, Cliente frecuente, Promoción...",
            no_discount: "Sin descuento",
            percentage: "Porcentaje",
            fixed_amount: "Monto Fijo",
            discount_applied: "Descuento aplicado:",
        },
        modal: {
            close_status: {
                title: "Estado de Cierre",
                message: "Por favor selecciona un estado de cierre para esta Tab",
            },
            close: "Cerrar Tab",
            cancel: "Cancelar Tab",
            payment: {
                title: "Registrar Pago",
                tip: "Propina",
                method: "Método",
                is_paid: "Pagado",
                closing_status: "Estado de Cierre",
                details: "Detalles de Pago",
            },
            close_confirm: {
                title: "Cerrar Tab",
                confirmation: "¿Estás seguro de que deseas cerrar esta Tab?",
                status: "Estado de Cierre",
            },
            assistance_dialog: {
                title: "Asistencia",
                message: "Tu solicitud de asistencia ha sido recibida.",
                staff_notified: "El personal ha sido notificado",
                store_label: "Tienda",
                customer_label: "Cliente",
                table_label: "Mesa",
                estimated_time_label: "Tiempo estimado",
                remaining_requests_label: "Solicitudes restantes",
                cooldown_remaining: "Tiempo de espera restante",
                close_button: "Cerrar",
            },
        },
        list: {
            timer: {
                confirmed: "Confirmado",
                in_preparation: "En Preparación",
            },
            item: {
                note: "Nota",
                option: "Opción",
            },
            total: "Total",
        },
        session: {
            table: "Mesa",
        },
        payment_method: {
            cash: "Efectivo",
            card: "Tarjeta",
            transfer: "Transferencia",
        },
        payment: {
            default: "Predeterminado",
            deferred: "Diferido",
            deferred_info: "Este método de pago tiene liquidación diferida y no se marcará como pagado inmediatamente.",
            error_loading_methods: "Error al cargar los métodos de pago",
            no_active_methods: "No hay métodos de pago activos disponibles",
            no_methods_configured: "No hay métodos de pago configurados",
        },
        queue: {
            download: "Tab #{id} en cola para descarga",
            print: "Tab #{id} en cola para impresión",
            payment_update: "Tab #{id} en cola para actualización de pago",
            status_update: "Tab #{id} en cola para actualización de estado a %{status}",
        },
        download: {
            success: "Tab #{id} descargada exitosamente",
            error: "Error descargando Tab #{id}: %{error}",
        },
        print: {
            success: "Tab #{id} enviada a la impresora",
            error: "Error imprimiendo Tab #{id}: %{error}",
        },
        payment_update: {
            success: "Pago de Tab #{id} actualizado exitosamente",
            error: "Error actualizando pago para Tab #{id}: %{error}",
        },
        status_update: {
            success: "Estado de Tab #{id} actualizado a %{status}",
            error: "Error actualizando estado para Tab #{id}: %{error}",
        },
        close: {
            success: "Tab #{id} cerrada exitosamente",
            error: "Error cerrando Tab #{id}: %{error}",
        },
        voice: {
            product_added: "%{quantity}x %{product} agregado por comando de voz",
            product_removed: "%{product} eliminado por comando de voz",
            quantity_changed: "Cantidad de %{product} cambiada a %{quantity}",
            note_added: "Nota agregada a %{product}",
            processing_error: "Error procesando comandos de voz",
            error: "Error de voz: %{error}",
        },
        status_change_notification: "El estado de la orden cambió de %{old} a %{new}",
        paid: "Pagado",
        total: "Total",
        item: {
            note: "Nota",
            option: "Opción",
        },
        assistance: {
            request_help: "Solicitar Asistencia",
            requesting: "Solicitando Asistencia...",
            help_description: "¿Necesitas ayuda? Toca para solicitar asistencia al personal.",
            success_message: "Solicitud de asistencia enviada exitosamente.",
            error_message: "Error al enviar solicitud de asistencia.",
            not_available: "Asistencia no disponible en este momento.",
            cooldown_remaining: "Espera %{time}",
        },
        product: {
            add: "Agregar",
            no_description: "Sin descripción disponible",
        },
        store: {
            featured_products: "Productos Destacados",
            no_products: "No hay productos destacados disponibles.",
        },
        debug: {
            title: "Info de Depuración",
            recording_state: "Estado de Grabación",
            processing_state: "Estado de Procesamiento",
            recording_attempts: "Intentos de Grabación",
            audio_chunks: "Fragmentos de Audio",
            session_id: "ID de Sesión",
            tab_id: "ID de Tab",
            has_tab_data: "Tiene Datos de Tab",
            last_transcription: "Última Transcripción",
            active: "Activo",
            inactive: "Inactivo",
            yes: "Sí",
            no: "No",
        },
        context: {
            title: "Contexto de Tab",
            table: "Mesa",
            status: "Estado",
            items: "Ítems",
            current_order: "Orden Actual",
            more_items: "... y %{count} ítems más",
        },
        resource: {
            tabs_admin: 'Administración de Tabs',
            filter: {
                status: 'Estado',
            },
            tabs: 'Tabs',
            kitchen: 'Cocina',
            menu: {
                list: 'Lista',
                kitchen_active: 'Órdenes Activas',
            },
            action: {
                create: 'Crear',
            },
        },
        view_order: {
            title: "Orden #%{id}",
            no_data: "No hay datos de la orden disponibles",
            products_title: "Productos",
            product_default: "Producto",
            option_default: "Opción",
            unit_price_suffix: "precio unitario",
            subtotal: "Subtotal",
            discount: "Descuento",
            total: "Total",
            paid: "Pagado",
            order_note: "Nota de la Orden",
            marketplace_info: "Marketplace: %{name}",
            type: "Tipo",
            payment_info: "Información de Pago",
            payment_status: "Estado de Pago",
            pending: "Pendiente",
            broker_status: "Estado del Broker",
            receipt: "Recibo",
            invoice: "Factura",
            view_document: "Ver Documento",
            dates_times: "Fechas y Horas",
            created_at: "Creado el",
            confirmed_at: "Confirmado el",
            preparing_at: "Iniciado el",
            prepared_at: "Preparado el",
            delivered_at: "Entregado el",
            closed_at: "Cerrado el",
            cancelled_at: "Cancelado el",
            tenant_info: "Información del Local",
            name: "Nombre",
            address: "Dirección",
            phone: "Teléfono",
            email: "Correo"
        },
        marketplace_view: {
            order_details: "Detalles de la Orden",
            order_id: "ID de Orden:",
            status: "Estado:",
            customer_info: "Información del Cliente",
            shipping_info: "Información de Envío",
            full_address: "Dirección Completa:",
            billing_info: "Información de Facturación",
            payment_info: "Información de Pago",
            total_paid: "Total Pagado:",
            na: "No hay datos de la orden del marketplace disponibles",
        },
        delivery: {
            not_specified: "No especificado",
        },
        common: {
            todos: "Todos",
            unsupported_method: "Método de entrega no soportado: %{method}",
        },
        agent: {
            recording: "Grabando",
            processing_voice: "Procesando voz",
            processing_image: "Procesando imagen",
            capturing: "Capturando",
            capturing_countdown: "Capturando en %{countdown}",
            applying: "Aplicando cambios",
            capture_preparing: "Preparando captura...",
            cancel: "Cancelar",
            capture_in: "Capturando en %{seconds}s",
            drawer_title: "Agente IA",
            voice_agent_title: "Agente de Voz",
            image_agent_title: "Agente de Imagen",
            voice_actions_title: "Acciones de Voz",
            voice_actions_count: "%{count} acciones de voz",
            image_actions_title: "Acciones de Imagen",
            image_actions_count: "%{count} acciones de imagen",
            last_transcription: "Última Transcripción",
            no_recent_transcriptions: "Sin transcripciones recientes",
            original_analysis: "Análisis Original",
            analysis_tooltip: "Ver análisis de IA",
            confidence: "Confianza",
            quantity: "Cantidad",
            no_name: "Producto sin nombre",
            total_time: "Tiempo total",
            unavailable: "(no disponible)",
            processing_info: "Información de Procesamiento",
            no_image_analysis: "No hay análisis de imagen disponible",
            camera_button_tooltip: "Capturar imagen",
            gallery_button_tooltip: "Elegir de la galería",
            voice_record_tooltip: "Grabar comando de voz",
            voice_stop_tooltip: "Detener grabación",
        },
    },
    kiosk: {
        // Header
        total: 'Total',
        clear_cart: 'Limpiar Carrito',
        view_order: 'Ver Orden',
        add_items_to_start: 'Agrega ítems para comenzar',

        // Navigation
        prev: 'Ant',
        next: 'Sig',
        page_of: 'Página %{current} de %{total} • %{items} ítems',
        products: 'Productos',

        // Product Card
        customizable: 'Personalizable',

        // Product Grid
        no_products_found: 'No se encontraron productos en esta categoría',

        // Cart View
        your_order: 'Tu Orden',
        cart_empty: 'Tu carrito está vacío',
        browse_menu: 'Explorar Menú',
        note: 'Nota',
        order_options: 'Opciones de Orden',
        delivery_method: 'Método de Entrega',
        table_number: 'Número de Mesa',
        your_name: 'Tu Nombre (Opcional)',
        special_instructions: 'Instrucciones Especiales (Opcional)',
        cancel_order: 'Cancelar Orden',
        confirm_order: 'Confirmar Orden',
        submitting: 'Enviando...',

        // Modifier Modal
        select_multiple: 'Selección múltiple',
        required: '*Requerido',
        cancel: 'Cancelar',
        add_to_order: 'Agregar a la Orden',

        // Confirmation View
        order_confirmed: '¡Orden Confirmada!',
        thank_you: 'Gracias por tu orden. Por favor espera a que llamen tu número.',
        your_order_number: 'Tu Número de Orden',
        status: 'Estado',
        start_new_order: 'Iniciar Nueva Orden',
        auto_reset_notice: 'Esta pantalla se reiniciará automáticamente en 30 segundos',
        loading: 'Cargando...',
    },
    // Resource labels for admin panel
    resource: {
        tabs_admin: "Admin Tabs",
        tabs: "Tabs",
        kitchen: "Cocina",
        menu: {
            list: "Lista",
        },
        action: {
            create: "⊕ Crear Tab",
        },
        filter: {
            status: "Estado",
        },
        layout: {
            products: "Productos",
            order: "Orden",
        },
        // Groups
        groups: {
            system_resources: 'Recursos del Sistema',
            products: 'Productos',
            integrations: 'Integraciones',
            configuration: 'Configuración',
            campaigns: 'Campañas',
            import_export: 'Importar/Exportar',
            cashier: 'Caja',
        },
        // System resources
        system: {
            tenants: {
                label: 'Clientes',
                menu_list: 'Clientes',
                menu_trash: 'Papelera',
                main_action: 'Agregar Cliente',
                filter_name: 'Nombre',
            },
            roles: {
                label: 'Roles',
                menu_list: 'Roles',
                main_action: 'Agregar Rol',
                filter_name: 'Nombre',
            },
            users: {
                label: 'Usuarios',
                menu_list: 'Usuarios',
                menu_trash: 'Papelera',
                main_action: 'Crear Usuario',
                filter_search: 'Buscar',
            },
        },
        // E-commerce resources
        ecommerce: {
            products: {
                label: 'Productos',
                menu_list: 'Productos',
                menu_trash: 'Papelera',
                main_action: 'Crear Producto',
                filter_name: 'Nombre',
                filter_description: 'Descripción',
                filter_sku: 'SKU',
                filter_categories: 'Categorías',
                filter_status: 'Estado',
                filter_is_pack: 'Es Pack',
            },
            categories: {
                label: 'Categorías',
                menu_list: 'Lista de Categorías',
                main_action: 'Crear Categoría',
                filter_name: 'Nombre',
            },
            brands: {
                label: 'Marcas',
                menu_list: 'Lista de Marcas',
                main_action: 'Crear Marca',
            },
            galleries: {
                label: 'Galerías',
                menu_list: 'Lista de Galerías',
                main_action: 'Crear Galería',
                filter_name: 'Nombre',
            },
            currencies: {
                label: 'Monedas',
                menu_list: 'Lista de Monedas',
                main_action: 'Crear Moneda',
            },
            pricelists: {
                label: 'Listas de Precios',
                menu_list: 'Listas de Precios',
                main_action: 'Crear Lista de Precios',
            },
            modifiers: {
                label: 'Grupos de Modificadores',
                menu_list: 'Lista de Modificadores',
                main_action: 'Crear Grupo de Modificadores',
                filter_name: 'Nombre',
                filter_selection_mode: 'Modo de Selección',
                filter_is_active: 'Activo',
            },
            stock_types: {
                label: 'Tipo de Stock',
                menu_list: 'Tipos de Stock',
                main_action: 'Crear Tipo de Stock',
            },
            marketplaces: {
                label: 'Marketplaces',
                menu_list: 'Ver Marketplaces',
                main_action: 'Agregar Marketplace',
            },
            point_of_sale: {
                label: 'Puntos de Venta',
                menu_list: 'Ver Puntos de Venta',
                main_action: 'Agregar Punto de Venta',
            },
            tenant_data: {
                label: 'Datos',
                menu_list: 'Módulo Cliente Ecommerce',
            },
            users: {
                label: 'Usuarios',
            },
        },
        // Campaigns
        campaigns: {
            label: 'Campañas',
            menu_list: 'Lista de Campañas',
            main_action: 'Crear',
            filter_name: 'Nombre',
        },
        // Import/Export
        import: {
            templates: {
                label: 'Plantillas de Importación',
                menu_list: 'Plantillas',
                main_action: 'Crear Plantilla',
            },
            instances: {
                label: 'Importar Productos',
                menu_list: 'Importaciones',
                main_action: 'Importar Productos',
                tabs: {
                    datos: 'Datos',
                    preview: 'Previsualizar',
                    import: 'Importar',
                    logs: 'Logs',
                },
                fields: {
                    import_type: 'Tipo de Importación',
                    template: 'Plantilla',
                    file: 'Archivo',
                    options: 'Opciones de Importación',
                    status: 'Estado',
                    preview: 'Previsualizar',
                    import_action: 'Importar',
                    logs: 'Logs',
                    created_at: 'Creado',
                    updated_at: 'Actualizado',
                },
                types: {
                    normalized: {
                        title: 'Importación Normalizada (Recomendado)',
                        desc: 'Utiliza el formato normalizado estándar con columnas predefinidas',
                    },
                    template: {
                        title: 'Importación con Plantilla',
                        desc: 'Utiliza una plantilla personalizada para mapear columnas',
                    },
                },
                options: {
                    advanced_config: 'Configuración Avanzada',
                    no_options: 'No hay opciones configurables para este tipo de importación.',
                    view_title: 'Opciones de Importación (%{type})',
                },
                alerts: {
                    select_template: 'Debe seleccionar una plantilla antes de subir el archivo',
                    normalized_format_title: 'Formato Normalizado:',
                    normalized_format_desc: 'Su archivo debe seguir el formato estándar con columnas como: sku, name, description, price_*, stock_*, category_name, brand_name, images, etc.',
                },
                messages: {
                    delete_file_confirm: '¿Está seguro de eliminar este registro?',
                    file_removed: '¡Archivo eliminado!',
                    delete_file_title: 'Eliminar archivo',
                    delete_file_content: '%{title} será eliminado',
                    only_excel: '¡Solo puedes subir archivos Excel!',
                    max_size: '¡El archivo debe ser menor a 2MB!',
                    no_file: '¡No hay archivo subido!',
                    unknown_format: 'Formato de archivo desconocido. ¡Solo se suben archivos Excel!',
                    no_data: '¡No se encontraron datos en el archivo!',
                    read_error: 'Error al leer el archivo Excel',
                },
                progress: {
                    title_preview: 'Progreso de Previsualización',
                    title_import: 'Progreso de Importación',
                    processed_count: '%{processed} de %{total} productos procesados',
                    currently_processing: 'Procesando actualmente:',
                    last_updated: 'Última actualización: %{time}',
                },
                stats: {
                    to_create: 'Por Crear',
                    to_update: 'Por Actualizar',
                    categories_to_create: 'Categorías por Crear',
                    brands_to_create: 'Marcas por Crear',
                    created: 'Creados',
                    updated: 'Actualizados',
                    categories_created: 'Categorías Creadas',
                    galleries_created: 'Galerías Creadas',
                    errors: 'Errores',
                    skipped: 'Omitidos',
                },
                dialog: {
                    already_completed: {
                        title: '%{mode} Ya Completado',
                        message: 'Este %{mode} ya se completó anteriormente.',
                        status: 'Estado actual: %{status}',
                        footer: 'Si necesita ejecutarlo nuevamente, actualice la página o cree una nueva instancia de importación.',
                    },
                    already_running: {
                        title: '%{mode} Ya en Ejecución',
                        message: '%{message}',
                        status: 'Estado actual: %{status}',
                        footer: 'Espere a que se complete el proceso actual o actualice la página para ver el estado más reciente.',
                    },
                },
                headers: {
                    preview_title: 'Previsualización de Importación Masiva',
                    preview_normalized_sub: 'Previsualización con formato normalizado',
                    preview_template_sub: 'Previsualización con plantilla personalizada',
                    import_title: 'Importación Masiva',
                    import_normalized_sub: 'Importación con formato normalizado',
                    import_template_sub: 'Importación con plantilla personalizada',
                },
                actions: {
                    preview_in_progress: 'Previsualización en progreso...',
                    preview_start: 'Previsualizar Importación',
                    import_in_progress: 'Importación en progreso...',
                    import_start: 'Iniciar Importación',
                },
                results: {
                    title: 'Resultados de %{mode}',
                },
                logs: {
                    placeholder: 'Previsualiza el log aquí...',
                    preview: 'Previsualizar',
                    download: 'Descargar',
                },
                statuses: {
                    NOT_INITIATED: 'No Iniciado',
                    PREVIEW_STARTED: 'Previsualización Iniciada',
                    PREVIEW_COMPLETED: 'Previsualización Completada',
                    PREVIEW_FAILED: 'Previsualización Fallida',
                    IMPORT_STARTED: 'Importación Iniciada',
                    IMPORT_COMPLETED: 'Importación Completada',
                    IMPORT_FAILED: 'Importación Fallida',
                }
            },
        },
        // Mall resources
        mall: {
            label: 'Mall',
            menu_list: 'Lista',
            main_action: 'Crear Mall',
        },
        // Cash Count resources
        cashcount: {
            label: 'Arqueos de Caja',
            menu_list: 'Arqueos de Caja',
            main_action: 'Nuevo Arqueo',
            filter_status: 'Estado',
            filter_period_start: 'Inicio Período (Desde)',
            filter_period_end: 'Fin Período (Hasta)',
        },
        qr_generator: {
            title_self_service: "Generador QR Auto-Servicio",
            title_mall: "Generador QR Servicio Mall",
            welcome_title: "Módulo de auto-atención",
            welcome_subtitle: "Haga su pedido desde su teléfono!",
            print: {
                title: "📱 Ordena desde tu celular",
                subtitle: "Escanea el código QR para ver el menú",
                instructions: "Apunta tu cámara al código QR",
            }
        },
        // Tenancy resources
        tenancy: {
            groups: {
                account: "Cuenta",
                billing: "Facturación",
                system: "Sistema"
            },
            account: {
                label: "Cuenta",
            },
            subscription: {
                label: "Suscripción",
            },
            invoices: {
                label: "Facturas",
            },
            payment_methods: {
                label: "Métodos de Pago",
            },
            tenants: {
                label: "Locales",
                menu_all: "Ver Todos",
                main_action: "Agregar Local",
            },
        },
    },
    // Dashboard
    dashboard: {
        title: "Panel de Control",
        welcome: "Bienvenido al Panel de Administración",
    },
    // Subscription module
    subscription: {
        fetch_error: "Error al obtener los planes de suscripción: %{message}",
        unsupported_plans: "%{count} plan(es) no disponible(s) con su método de pago actual. Para acceder a todos los planes, considere cambiar su método de pago.",
        no_compatible_plans: "No hay planes disponibles compatibles con su método de pago actual (%{gateway}). Por favor, contacte al administrador del sistema.",
        management: {
            title: "Gestión de Suscripción",
            subtitle: "Administra tu plan de suscripción y configuración de facturación.",
        },
        current: {
            title: "Suscripción",
            subtitle: "Administra tu suscripción y complementos.",
        },
        available_plans: {
            title: "Planes Disponibles",
            subtitle: "Elige un plan que se adapte a tus necesidades. Puedes mejorar o cambiar en cualquier momento.",
        },
        renews: "Renueva",
        no_active: "No tienes una suscripción activa. Elige un plan a continuación para comenzar.",
        current_plan: "Plan Actual",
        select_plan: "Seleccionar Plan",
        trial_days: "%{days} días de prueba",
        // Feature translations
        features: {
            basic_features: "Funciones básicas",
            email_support: "Soporte por email",
            one_store: "1 local incluido",
            three_users: "3 usuarios",
            fifty_products: "50 productos",
            unlimited_products: "Productos ilimitados",
            unlimited_users: "Usuarios ilimitados",
            priority_support: "Soporte prioritario",
            advanced_analytics: "Analíticas avanzadas",
            api_access: "Acceso a API",
        },
        // Plan change notifications
        pending_change_title: "Cambio de Plan Pendiente",
        pending_change_message: "Tu cambio de plan a %{plan} está pendiente de confirmación de pago. Recibirás un correo electrónico una vez que el pago sea procesado.",
        confirm_upgrade_title: "Confirmar Mejora de Plan",
        confirm_upgrade: "¿Estás seguro de que deseas mejorar a %{plan}?",
        confirm_downgrade_title: "Confirmar Cambio de Plan",
        confirm_downgrade: "¿Estás seguro de que deseas cambiar a %{plan}?",
        confirm_change_title: "Confirmar Cambio de Plan",
        confirm_change: "¿Estás seguro de que deseas cambiar a %{plan}?",
        upgrade_success: "Plan mejorado exitosamente a %{plan}",
        downgrade_success: "Plan cambiado exitosamente a %{plan}",
        change_success: "Plan cambiado exitosamente a %{plan}",
        upgrade_error: "Error al mejorar el plan",
        downgrade_error: "Error al cambiar el plan",
        change_error: "Error al cambiar el plan",
        downgrade_not_allowed: "No se permite cambiar a %{plan}",
        // Unsubscribe
        unsubscribe: {
            button: "Cancelar Suscripción",
            processing: "Cancelando...",
            confirm_title: "Cancelar Suscripción",
            confirm_message: "¿Estás seguro de que deseas cancelar tu suscripción?",
            confirm_button: "Cancelar Suscripción",
            access_until: "Acceso hasta:",
            days_remaining: "Días restantes:",
            what_happens_title: "Qué sucede cuando cancelas:",
            success: "Suscripción cancelada. Acceso hasta %{date}.",
            error: "Error al cancelar la suscripción",
            preview_error: "Error al cargar detalles de cancelación",
        },
        // Subscription management actions
        manage: "Administrar",
        choose_plan: "Elegir un plan",
        cancel_plan: "Cancelar plan",
        cancel_success: "Suscripción cancelada exitosamente",
        cancel_error: "Error al cancelar la suscripción",
        // Subscription details labels
        active: "Suscripción Activa",
        status_label: "Estado:",
        billing_cycle_label: "Ciclo de Facturación:",
        current_period_label: "Período Actual:",
        trial_ends_label: "Prueba Termina:",
        next_billing_label: "Próxima Facturación:",
        pending_change: "Cambio Pendiente",
        switching_to: "Cambiando a:",
        effective_date: "Efectivo:",
    },
    // Billing & Payment Gateways
    billing: {
        // Gateway Selector
        selectPaymentMethod: "Selecciona un Proveedor de Pago",
        selectPaymentMethodDesc: "Elige cómo quieres pagar tu suscripción",
        noGatewaysAvailable: "No hay métodos de pago disponibles para tu cuenta",
        supportedCurrencies: "Monedas",
        connecting: "Conectando...",
        addCard: "Agregar Tarjeta",
        
        // Add Payment Method Prompt
        addPaymentRequired: "Método de Pago Requerido",
        trialEndsIn: "Tu período de prueba termina en %{days} día(s)",
        trialEnded: "Tu período de prueba ha terminado",
        planContinue: "Agrega un método de pago para continuar usando %{plan}",
        
        // Gateway Callback
        callback: {
            processing: "Procesando tu tarjeta...",
            pleaseWait: "Por favor espera mientras completamos tu registro.",
            success: "¡Método de pago agregado exitosamente!",
            successTitle: "¡Éxito!",
            redirecting: "Redirigiendo...",
            noToken: "No se recibió token de registro",
            error: "Error al completar el registro",
            errorTitle: "Algo salió mal",
            tryAgain: "Intentar de Nuevo",
        },
        
        // Payment Methods
        paymentMethods: {
            title: "Métodos de Pago",
            addNew: "Agregar Método de Pago",
            setDefault: "Establecer como Predeterminado",
            remove: "Eliminar",
            default: "Predeterminado",
            expiresOn: "Vence el %{date}",
            noMethods: "Aún no has agregado métodos de pago",
        },
        
        // Invoices
        invoices: {
            title: "Documento de Pago",
            document: "Documento",
            preview: "Vista previa del documento",
            view: "Ver",
            download: "Descargar",
            downloadAll: "Descargar Todo",
            close: "Cerrar",
            loading: "Cargando documento...",
            loadError: "Error al cargar el documento",
            downloadSuccess: "Documento descargado correctamente",
            downloadError: "Error al descargar el documento",
            notAvailable: "Documento no disponible",
            browserNotSupported: "Tu navegador no puede mostrar PDFs. Por favor descarga el documento.",
            // Document types
            documentType: {
                receipt: "Recibo",
                invoice: "Factura",
                document: "Documento",
            },
            // Status labels
            status: {
                succeeded: "Pagado",
                paid: "Pagado",
                pending: "Pendiente",
                failed: "Fallido",
                refunded: "Reembolsado",
            },
        },
    },
    mall: {
        // Orders
        no_active_orders: "No tienes órdenes activas. Puedes crear una nueva orden usando el menú.",

        // Store Selector
        all_stores: 'Todas las Tiendas',
        select_store: 'Selecciona una tienda',
        all: 'Todo',

        // Assistance
        request_assistance: 'Solicitar Asistencia',
        assistance_sent: 'Solicitud de asistencia enviada',
        assistance_error: 'Error al enviar solicitud de asistencia',

        // Search
        search_products: 'Buscar productos...',

        // Product Grid
        no_products_found: 'No se encontraron productos',
        try_different_store_or_search: 'Intenta seleccionar otra tienda o ajustar tu búsqueda',
        featured: 'Destacados',
        add: 'Agregar',

        // Pagination
        display_mode: 'Visualización',
        horizontal_pagination: 'Ver productos en páginas',
        infinite_scroll: 'Ver todos los productos en scroll',
        pages: 'Páginas',
        scroll: 'Scroll',
        prev: 'Ant',
        next: 'Sig',
        swipe_for_more: 'Desliza para más',
        products: 'productos',
        scroll_for_more: 'Desliza para más',

        // Cart Summary
        cart_empty: 'Tu carrito está vacío',
        view_cart: 'Ver Carrito',
        item: 'ítem',
        items: 'ítems',
        stores: 'tiendas',

        // Cart Drawer
        your_order: 'Tu Orden',
        add_products_to_continue: 'Agrega algunos productos para continuar',
        unknown_store: 'Tienda Desconocida',
        clear_cart: 'Limpiar Carrito',
        total: 'Total',
        confirm_order: 'Confirmar Orden',
        submit_order: 'Crear Pedido',
        submitting_order: 'Creando...',
        confirm_own_order: 'Confirmar Pedido',
        confirming_own_order: 'Confirmando...',
        confirm_order_error: 'No se pudo confirmar el pedido: %{error}',
        pay_online: 'Pagar en línea',
        checkout_redirecting: 'Redirigiendo...',
        checkout_error: 'No se pudo iniciar el pago en línea: %{error}',
        continue_shopping: 'Continuar Comprando',
        product_added: 'Producto agregado al carrito',
        product_added_with_name: '%{name} agregado al carrito',
        special_instructions: 'Instrucciones Especiales',
        special_instructions_placeholder: 'Agrega notas (ej: sin mayonesa, extra servilletas)...',
        modifiers: 'Modificadores',
        add_to_cart: 'Agregar al Carrito',
        required: 'Requerido',

        // Product Grid
        all_products: 'Todos los Productos',
        has_modifiers: 'Personalizable',
        no_more_products: 'No hay más productos',
        errors: {
            sessionIdRequired: "Se requiere ID de sesión de Mall",
            validationDefault: "Ocurrió un error validando la sesión",
            sessionExpired: "La sesión ha expirado. Las sesiones son válidas por 10 horas desde su activación.",
            sessionNotFound: "Sesión no encontrada. Por favor verifica el ID de sesión.",
            accessDenied: "Acceso denegado a esta sesión.",
            serverError: "Ocurrió un error en el servidor. Por favor intenta más tarde.",
            unableToValidate: "No se pudo validar la sesión. Por favor intenta de nuevo.",
        },
        session: {
            no_hash: "No se encontró hash de sesión de mall. No se puede rastrear el progreso de la orden.",
            order_status: {
                created: "Creado",
                created_text: "Tu orden ha sido creada. Por favor espera a que el personal la confirme.",
                confirmed: "Confirmado",
                confirmed_text: "Tu orden ha sido confirmada.",
                in_progress: "En Progreso",
                in_progress_text: "Tu orden está siendo procesada. Por favor espera.",
                in_preparation: "Preparando",
                in_preparation_text: "Tu orden está siendo preparada.",
                prepared: "Listo",
                prepared_text: "Tu orden está lista para retiro.",
                delivered: "Listo para Retiro",
                delivered_text: "Tu orden está lista para retiro. Por favor recógela en el área designada.",
                shipped: "Completado",
                shipped_text: "Tu orden ha sido enviada. ¡Gracias por tu compra!",
                picked_up: "Retirado",
                picked_up_text: "Tu orden ha sido retirada. ¡Gracias por tu compra!",
                closed: "Completado",
                closed_text: "Tu orden ha sido completada. ¡Gracias por tu compra!",
                returned: "Completado",
                returned_text: "Tu orden ha sido devuelta. ¡Gracias por tu compra!",
                cancelled: "Cancelado",
                cancelled_text: "Tu orden ha sido cancelada. Si tienes preguntas, por favor contacta soporte.",
                not_shipped: "Cancelado",
                not_shipped_text: "Tu orden no ha sido enviada. Si tienes preguntas, por favor contacta soporte.",
            },
            no_notifications: "Sin notificaciones",
            notifications: "Notificaciones",
            products_count: "Productos (%{count})",
            product: {
                unknown: "Producto Desconocido",
                quantity: "Cant: %{quantity}",
                pending: "Pendiente",
            },
            order_status_overall: "Estado General de la Orden",
            stores_progress: "Progreso por Tienda",
            items: "ítems",
        },
    },

    selfservice: {
        welcome: {
            title: "¡Bienvenido!",
            subtitle: "",
            name_label: "Tu nombre",
            name_placeholder: "Ingresa tu nombre",
            delivery_method_label: "¿Cómo deseas recibir tu pedido?",
            table_service: "En mi mesa",
            counter_pickup: "En mostrador",
            table_label: "Número de mesa",
            counter_info: "Tu pedido estará listo para recoger en el mostrador. Te notificaremos cuando esté listo.",
            continue_button: "Continuar con mi orden",
            start_button: "Haz tu pedido!",
            session_info: "Sesión segura • Tus datos están protegidos",
        },
        menu: {
            your_orders: "Tus Ordenes",
            new_order: "Nueva Orden",
            order_here: "¡Haz tu pedido aquí!",
            place_order: "Hacer un pedido",
            checkout: "Ordenar",
        },
        timeline: {
            title: "Estado del Pedido",
        },
        voucher: {
            title: "Comprobante",
            dialog_title: "Comprobante",
            load_error: "Error cargando el comprobante",
            loading: "Generando comprobante...",
            pending_confirmation: "El comprobante estará disponible una vez que el pedido sea confirmado.",
        },
        notifications: {
            title: "Notificaciones",
            new_update: "Nueva actualización en su pedido",
            mark_all_read: "Marcar todo como leído",
            empty: "No tiene notificaciones recientes.",
            empty_hint: "Las actualizaciones del pedido aparecerán aquí.",
        },
        settings: {
            title: "Configuración",
            save_button: "Guardar Cambios",
        }
    },


    common: {
        cancel: "Cancelar",
        keep: "Mantener Suscripción",
        view: "Ver",
        edit: "Editar",
        login: "Ingresar",
        signup: "Registrarse",
        unknown_error: "Error desconocido",
    },
    cashcount: {
        sales_count: "%{count} ventas",
        sales_count_short: "Ventas",
        amount: "Monto",
        tips: "Propinas",
        system_totals: "Totales del Sistema",
        final_totals: "Totales Finales",
        corrected: "Corregido",
        modified: "Modificado",
        system: "Sistema",
        location: "Ubicación",
        status: "Estado",
        unknown_location: "Ubicación Desconocida",
        system_values: "Sistema: %{sales} ventas, %{amount}, %{tips} propinas",
        was_value: "era %{value}",
        pos_breakdown: "Desglose por Punto de Venta",
        system_calculated_totals: "Totales Calculados por Sistema",
        status_closed: "✅ Este arqueo está finalizado y no puede ser modificado.",
        status_draft: "⚠️ Listo para cerrar: Guardar finalizará este arqueo permanentemente.",
        status_preview: "💡 Revisa y ajusta totales individuales por ubicación abajo. Los totales finales se calcularán automáticamente.",
        pos_breakdown_description: "Ajusta totales individuales por ubicación. Los totales principales se recalcularán automáticamente.",
        final_values: "Valores Finales",
        totals: "TOTALES",
        notes: "Notas",
        notes_placeholder: "Agrega notas sobre correcciones u observaciones...",
        notes_corrections_help: "Por favor explica la razón de las correcciones arriba.",
        notes_help: "Notas opcionales sobre este arqueo.",
        invalid_date: "Fecha inválida",
        duration_label: "Duración: %{duration}",
        cash_count_period: "Período de Arqueo",
        cash_count_period_readonly: "Período de Arqueo (Solo Lectura)",
        period_start: "Inicio Período",
        period_end: "Fin Período",
        duration: "Duración",
        period_auto_calculated: "Las fechas del período se calcularán automáticamente",
        automatic_calculation: "Cálculo Automático de Período:",
        automatic_calculation_description: "El arqueo comenzará donde terminó el último y continuará hasta ahora, asegurando que no haya brechas en tus registros.",
        current_period_sales: "Ventas del Período Actual",
        refresh: "Actualizar",
        first_period_message: "Este es tu primer período de arqueo. Mostrando ventas desde %{start} (hace %{days} días) hasta ahora.",
        period_since_last: "Mostrando ventas desde el último arqueo cerrado el %{lastEnd} (hace %{days} días).",
        total_sales: "Ventas Totales",
        total_amount: "Monto Total",
        total_tips: "Propinas Totales",
        daily_average: "Prom: %{avg}/día",
        growth_comparison: "Comparación de Crecimiento",
        daily_average_comparison: "Promedios diarios comparados con el último período cerrado",
        sales: "Ventas",
        percentage: "% del Total",
        top_products: "Productos Top",
        product: "Producto",
        quantity_sold: "Cant. Vendida",
        avg_price: "Precio Prom.",
        recent_orders: "Ordenes Recientes",
        order_id: "ID Orden",
        date_time: "Fecha y Hora",
        items: "Ítems",
        current_period_error: "Error cargando datos del período actual",
    },
    mission: {
        title: "Misión",
        description: "Descripción de la Misión",
        start: "Inicio",
        end: "Fin",
        status: "Estado",
        completed: "Completada",
        failed: "Fallida",
        in_progress: "En Progreso",
        not_started: "No Iniciada",
    },
    voice: {
        recording: "Grabando...",
        processing: "Procesando...",
        processing_ai: "Procesando con IA...",
        processing_voice: "Procesando voz...",
        processing_image: "Procesando imagen...",
        capturing: "Capturando...",
        capturing_countdown: "Capturando en %{countdown}...",
        applying: "Aplicando...",
        stop: "Detener",
        record: "Grabar",
        stop_recording: "Detener grabación",
        start_recording: "Iniciar grabación",
        stop_recording_full: "Detener Grabación",
        start_recording_full: "Iniciar Grabación",
        recording_disabled: "Grabación deshabilitada",
        recording_disabled_full: "Grabación de voz deshabilitada",
        ready_to_record: "Listo para grabar",
        actions_detected: "%{count} acción(es) detectada(s)",
        error_processing: "Error procesando comando de voz",
        error_connection: "Error de conexión. Revisa tu internet.",
        error_file_too_large: "El archivo de audio es demasiado grande",
        error_invalid_format: "Formato de audio inválido",
        applying_commands: "Aplicando comandos de voz...",
        error_enhanced: "Error procesando comandos de voz mejorados",
        ai_label: "IA",
        auto_label: "Auto",
        auto_apply_info: "Las acciones se aplicarán automáticamente",
        view_ai_analysis: "Ver análisis de IA",
        analysis: {
            title: "Análisis de Voz IA",
            transcription: "Transcripción",
            processing_steps: "Pasos de Procesamiento",
            actions_detected: "Acciones Detectadas (%{count})",
            no_data: "No hay análisis disponible",
            record_command: "Graba un comando de voz para ver análisis",
            view: "Ver análisis de IA",
            steps: {
                extraction: "1. Extracción",
                products: "2. Productos",
                enhanced: "3. IA Mejorada",
            },
            enhanced_results: "Resultados Mejorados",
            actions_count: "%{count} acciones",
            products_count: "%{count} productos",
            modifiers_ai: "%{count} modificadores IA",
            auto_added: "%{count} auto-agregados",
            products_found: "✓ %{count} producto(s) encontrado(s)",
            modifiers_ai_label: "🤖 Modificadores IA: %{modifiers}",
            modifiers_detected: "📝 Modificadores detectados: %{modifiers}",
            note: "📝 Nota: %{note}",
            ai_analysis: "💭 %{analysis}",
            resolved: "✓ Resuelto: %{products}",
            metrics: {
                actions: "Acciones",
                products: "Productos",
                modifiers_ai: "Modificadores IA",
                auto_added: "Auto-agregados",
            },
        },
        examples: {
            title: "Ejemplos de comandos",
            add_two_burgers: "Agrega dos hamburguesas con queso",
            large_coffee: "Quiero un café grande para llevar",
            remove_pizza: "Quita la pizza de la orden",
            change_quantity: "Cambia la cantidad de tacos a tres",
            add_note: "Agrega nota: sin cebolla en el burrito",
            remove_second: "Quita el segundo ramen",
            modify_quantity: "Cambia el lomo a cantidad 1",
            add_note_no_spicy: "Agrega nota sin picante al ceviche",
        },
        assistant: {
            title: "Asistente de Voz IA",
        },
    },
    category: {
        all: "Todo",
        all_plural: "Todos",
    },
    payment: {
        default: "★",
    },
    tabs: {
        mall_notifications: {
            // Status titles
            order_in_preparation: 'Orden en preparación',
            order_ready: '¡Orden lista!',
            order_ready_pickup: 'Lista para retiro',
            order_completed: 'Orden completada',
            order_cancelled: 'Orden cancelada',
            order_confirmed: 'Orden confirmada',
            order_status_updated: ':store actualizó tu orden a :status',

            // Status messages
            order_in_preparation_message: ':store está preparando tu orden',
            order_prepared_message: ':store tiene :count ítems listos',
            order_delivered_message: ':store ha entregado tu orden',
            order_status_message: ':store: La orden está ahora :status',

            // Tab creation
            new_order_created: 'Nueva orden creada',
            new_order_at_store: 'Nueva orden en :store',
            new_order_message: 'Orden de :customer en mesa :table',
            new_order_message_no_table: 'Orden de :customer',
            new_order_with_items: ':customer en mesa :table ordenó :count ítems',

            // Assistance
            assistance_requested: '¡Asistencia solicitada!',
            assistance_message: ':customer en mesa :table necesita ayuda',
        },
    },
    dash: {
        resource: {
            created: 'Recurso Creado',
            created_message: 'Se ha creado el recurso %{label}',
            updated: 'Recurso Actualizado',
            updated_message: 'Se ha actualizado el recurso %{label}',
            edited: 'Recurso Editado',
            error: 'Error en %{label}',
        },
        action: {
            cancel: 'Cancelar',
            confirm: 'Confirmar',
            continue: 'Continuar',
            edit: 'Editar',
            save: 'Guardar',
            delete: 'Eliminar',
        }
    },
    tenant: {
        tests: {
            title: 'Pruebas del Sistema',
            subtitle: 'Verificar funcionalidades de notificaciones e impresión',
            run: 'Ejecutar',
            running: 'Ejecutando...',
            success: 'Prueba exitosa',
            error: 'Prueba fallida',
            electron_only: 'Solo disponible en la aplicación de escritorio',
            categories: {
                notifications: 'Notificaciones',
                notifications_desc: 'Probar mecanismos de entrega de notificaciones',
                printing: 'Impresión',
                printing_desc: 'Probar funcionalidad de impresión',
            },
            items: {
                fcm_notification: 'Probar Notificación FCM',
                fcm_notification_desc: 'Enviar notificación push a todos los usuarios del tenant con tokens FCM',
                audio_notification: 'Probar Notificación de Audio',
                audio_notification_desc: 'Reproducir la alarma con la configuración guardada',
                tts_notification: 'Probar Notificación TTS',
                tts_notification_desc: 'Probar texto a voz (solo Electron)',
                local_print: 'Impresión Local',
                local_print_desc: 'Imprimir página de prueba directamente vía IPC (solo Electron)',
                network_print: 'Impresión de Red',
                network_print_desc: 'Enviar comando de impresión vía WebSocket al servicio kt_service',
            },
            messages: {
                no_tenant: 'No hay contexto de tenant disponible',
                test_completed: 'Prueba completada exitosamente',
                test_executed: 'Prueba ejecutada exitosamente',
            },
        },
        alarm_settings: {
            title: 'Configuración de Alarma',
            subtitle: 'Configurar sonidos de alarma para notificaciones',
            test_alarm: 'Probar Alarma',
            playing: 'Reproduciendo...',
            reset: 'Restablecer',
            save: 'Guardar Configuración',
            saving: 'Guardando...',
            saved: 'Configuración de alarma guardada',
            save_error: 'Error al guardar configuración',
            test_completed: 'Prueba de alarma completada',
            test_error: 'Error al reproducir alarma',
            create_first: 'La configuración de alarma puede configurarse después de crear el tenant.',
            settings: {
                alarm_duration: 'Duración de Alarma',
                alarm_duration_desc: 'Cuánto tiempo suena la alarma (máximo 10 segundos)',
                high_frequency: 'Frecuencia Alta',
                high_frequency_desc: 'Frecuencia del pitido agudo',
                low_frequency: 'Frecuencia Baja',
                low_frequency_desc: 'Frecuencia del pitido grave',
                beep_duration: 'Duración del Pitido',
                beep_duration_desc: 'Duración de cada pitido',
                beep_gap: 'Espacio entre Pitidos',
                beep_gap_desc: 'Espacio entre pitidos en un patrón',
                pattern_gap: 'Espacio de Patrón',
                pattern_gap_desc: 'Espacio entre patrones de pitidos',
            },
            units: {
                seconds: 's',
                hertz: 'Hz',
                milliseconds: 'ms',
            },
        },
        store_schedule: {
            title: 'Horario de Tienda',
            subtitle: 'Configurar disponibilidad de apertura automática',
            enable_schedule: 'Habilitar Horario Programado',
            enabled: 'Activo',
            disabled: 'Deshabilitado (Modo Manual)',
            disabled_warning: 'El horario está deshabilitado. El estado de la tienda debe gestionarse manualmente en la pestaña Estado.',
            day: 'Día',
            active: 'Activo',
            hours: 'Horas de Apertura',
            add: 'Agregar',
            open: 'Abre',
            close: 'Cierra',
            save_success: 'Horario guardado exitosamente',
            save_error: 'Error al guardar el horario',
            fetch_error: 'Error al cargar el horario',
        },
        store_status: {
            title: 'Estado de Tienda',
            subtitle: 'Estado operativo actual y controles manuales',
            current_status: 'Estado Actual',
            open: 'ABIERTO',
            closed: 'CERRADO',
            open_store: 'Abrir Tienda',
            close_store: 'Cerrar Tienda',
            schedule_active: 'Horario Activo',
            manual_close_warning: 'La tienda está cerrada manualmente. Se abrirá automáticamente en el próximo horario programado.',
            manual_open_warning: 'La tienda está abierta manualmente. Se actualizará según el horario cuando corresponda (ej. al entrar en periodo cerrado).',
            following_schedule: 'La tienda opera según el horario programado (Zona horaria: %{timezone}).',
            manual_mode_info: 'El horario está deshabilitado. Debe abrir y cerrar la tienda manualmente.',
        },
        marketplaces: {
            title: 'Integración con Marketplaces',
            subtitle: 'Conectar y gestionar relaciones con marketplaces',
            nombre: 'Nombre',
            clase: 'Clase',
            select: 'Seleccione',
            select_marketplaces: 'Seleccione marketplaces',
            delete_selected: 'Borrar seleccionados',
        },
        point_of_sales: {
            title: 'Integración de Puntos de Venta',
            subtitle: 'Conectar y gestionar relaciones con puntos de venta',
            nombre: 'Nombre',
            clase: 'Clase',
            select: 'Seleccione',
            select_pos: 'Seleccione puntos de venta',
            delete_selected: 'Borrar seleccionados',
        },
    },
    "dash-auto-admin-tabs": {
        "Productos": "Productos",
        "Actualizaciones": "Actualizaciones",
        "Vouchers": "Vouchers",
        "Datos": "Datos",
    },
    
    // Contenido de la Página de Inicio
    landing: {
        login : {
            email: 'Email',
            password: 'Contraseña',
            submit: 'Ingresar',
            resetPassword: 'Resetear contraseña'
        },
        hero: {
            title: "KitchnTabs",
            subtitle: "La infraestructura operativa que conecta todos los restaurantes del mundo",
            description: "Una plataforma tecnológica diseñada para patios de comida y restaurantes que permite digitalizar, ordenar y sincronizar todo el proceso de pedidos, desde la toma de comandas hasta la preparación y entrega.",
            cta: "Comenzar",
            learnMore: "Conocer Más",
            trialTitle: "¡Únete a KitchnTabs gratis ahora!",
            trialSubtitle: "Comienza tu periodo de 30 días gratis. No requiere tarjeta de crédito.",
            emailPlaceholder: "Ingresa tu correo electrónico",
            createStore: "CREAR TIENDA"
        },
        what: {
            title: "¿Qué es KitchnTabs?",
            description: "KitchnTabs es una plataforma tecnológica diseñada para patios de comida y restaurantes, que permite digitalizar, ordenar y sincronizar todo el proceso de pedidos, desde la toma de comandas hasta la preparación y entrega, conectando a cocina, atención y administración en tiempo real."
        },
        features: {
            title: "Características Principales",
            subtitle: "Todo lo que necesitas para gestionar tu restaurante eficientemente",
            digitalOrders: {
                icon: "📲",
                title: "Digitaliza la toma de pedidos",
                description: "Permite registrar comandas desde dispositivos móviles, reduciendo errores y tiempos de atención."
            },
            optimizeKitchen: {
                icon: "🍳",
                title: "Optimiza la operación en cocina",
                description: "La cocina recibe pedidos claros, ordenados y en tiempo real, con estados visuales y tiempos de preparación."
            },
            syncTeam: {
                icon: "🔄",
                title: "Sincroniza a todo el equipo",
                description: "Meseros, cocina y administración trabajan sobre la misma información, sin duplicaciones ni confusiones."
            },
            independence: {
                icon: "🧩",
                title: "Respeta la independencia de cada local",
                description: "Cada restaurante mantiene su operación, productos y precios, dentro de una plataforma común."
            },
            unifiedExperience: {
                icon: "🏬",
                title: "Habilita una experiencia unificada en el patio",
                description: "Los clientes pueden, en etapas posteriores, pedir desde su celular a distintos locales en un solo flujo."
            },
            visibility: {
                icon: "📊",
                title: "Entrega visibilidad y control",
                description: "Permite ver pedidos activos, tiempos de preparación y estado de las órdenes en tiempo real."
            },
            onlineSales: {
                icon: "🌐",
                title: "Prepara el camino para la venta online",
                description: "Facilita la futura venta digital y la gestión centralizada de despachos para todo el patio."
            },
            scalable: {
                icon: "🚀",
                title: "Escala con el crecimiento del patio",
                description: "La plataforma incorpora progresivamente nuevas funcionalidades como pagos digitales, integración con marketplaces, control de inventarios y logística."
            }
        },
        vision: {
            title: "Nuestra Visión",
            subtitle: "La infraestructura operativa que conecta todos los restaurantes del mundo",
            description: "KitchenTabs existe para convertirse en el sistema nervioso de la industria global de servicios de alimentos — una plataforma universal capaz de coordinar cocinas, equipos, pedidos, pagos y logística en tiempo real, independientemente del tamaño, formato o ubicación de un restaurante.",
            goals: {
                title: "Estamos construyendo hacia un futuro donde:",
                items: [
                    "Las operaciones de restaurantes son completamente digitales, conectadas y autónomas",
                    "Los pedidos, pagos, inventario y despacho fluyen sin fricción",
                    "La inteligencia del sistema mejora aprendiendo de millones de cocinas simultáneamente",
                    "La tecnología se adapta al restaurante, no al revés"
                ]
            },
            statement: "KitchenTabs no es solo otra herramienta de software. Su objetivo es convertirse en el estándar operativo global para restaurantes — la capa invisible que permite a millones de cocinas operar más rápido, más inteligente y más sosteniblemente."
        },
        benefits: {
            title: "Beneficios para tu Restaurante",
            fasterProcessing: {
                icon: "🚀",
                title: "Procesamiento más Rápido",
                description: "La interfaz simplificada reduce el tiempo de preparación"
            },
            improvedCommunication: {
                icon: "📱",
                title: "Comunicación Mejorada",
                description: "Actualizaciones en tiempo real entre el salón y la cocina"
            },
            reducedErrors: {
                icon: "🎯",
                title: "Reducción de Errores",
                description: "Las pantallas visuales de productos minimizan los errores"
            },
            betterTiming: {
                icon: "⏱️",
                title: "Mejor Sincronización",
                description: "Los temporizadores integrados ayudan a mantener estándares de servicio consistentes"
            },
            insights: {
                icon: "📊",
                title: "Información de Rendimiento",
                description: "Datos sobre tiempos de preparación y cuellos de botella"
            },
            coordination: {
                icon: "👥",
                title: "Coordinación del Equipo",
                description: "El acceso basado en roles asegura una gestión adecuada del flujo de trabajo"
            }
        },
        dashboard: {
            title: "Panel de Control Centralizado",
            description: "KitchnTabs centraliza y digitaliza la operación diaria del restaurante, permitiendo que todo el equipo trabaje de forma coordinada y en tiempo real.",
            features: {
                realtime: "📋 Visualizar órdenes activas y completadas en tiempo real",
                statusChange: "🔄 Cambiar el estado de las órdenes a lo largo del flujo operativo",
                payments: "💳 Gestionar pagos y cierres de cuenta desde un mismo sistema",
                closings: "🧾 Registrar cierres operativos de forma ordenada y trazable"
            },
            sync: "Cada acción se sincroniza instantáneamente con el resto del equipo gracias a un sistema de notificaciones en tiempo real, asegurando que cocina, caja y atención al cliente estén siempre alineados."
        },
        future: {
            title: "El Futuro del Servicio de Alimentos",
            description: "Queremos facilitar el proceso de la toma de comandas, sin embargo, nuestro último objetivo es suplir la falta de servicio en el Patio de comidas, preparando el camino para ofrecer una experiencia de pedidos digitales directamente desde el cliente en cada local a través de una experiencia unificada para el cliente, a través de un Kiosco de autoatención y un código QR que le permitirá a los clientes auto atenderse directamente desde la mesa."
        },
        contact: {
            title: "Contáctanos",
            description: "Es muy fácil ponerse en contacto con nosotros. Solo usa el formulario de contacto o envíanos un correo electrónico.",
            formTitle: "Contáctanos rápidamente",
            name: "Ingresa tu nombre",
            email: "Ingresa tu correo",
            phone: "Tu Teléfono",
            company: "Tu Empresa",
            message: "Mensaje",
            submit: "Enviar Mensaje",
            office: "Oficina Principal",
            contactEmail: "Correo"
        },
        newsletter: {
            placeholder: "Ingresa tu correo",
            subscribe: "Suscribirse",
            title: "Mantente Actualizado",
            description: "Suscríbete a nuestro boletín para recibir las últimas actualizaciones"
        },
        cta: {
            title: "¡Comienza tu camino con nosotros!",
            subtitle: "Comienza tu periodo de 30 días gratis. No requiere tarjeta de crédito."
        },
        footer: {
            description: "Sistema de gestión gastronómica",
            contact: "Contacto",
            terms: "Términos",
            security: "Seguridad",
            privacy: "Privacidad",
            copyright: "© KitchnTabs, Todos los derechos reservados"
        },
        download: {
            title: "Descarga KitchnTabs",
            subtitle: "Una plataforma tecnológica diseñada para patios de comida y restaurantes que digitaliza, ordena y sincroniza todo el proceso de pedidos.",
            what_is_title: "¿Qué es KitchnTabs?",
            what_is_description: "KitchnTabs es una plataforma tecnológica diseñada para patios de comida y restaurantes, que permite digitalizar, ordenar y sincronizar todo el proceso de pedidos, desde la toma de comandas hasta la preparación y entrega, conectando a cocina, atención y administración en tiempo real.",
            download_title: "Descarga la Aplicación",
            download_subtitle: "Disponible para todas las plataformas. Elige tu sistema operativo y comienza a optimizar las operaciones de tu restaurante hoy.",
            admin_panel_text: "¿Ya tienes una cuenta? Accede al panel de administración",
            admin_panel_button: "Acceder al Panel de Admin",
            features: {
                digitize: {
                    title: "Digitaliza la Toma de Pedidos",
                    description: "Registra comandas desde dispositivos móviles, reduciendo errores y tiempos de atención."
                },
                kitchen: {
                    title: "Optimiza la Operación en Cocina",
                    description: "La cocina recibe pedidos claros, ordenados y en tiempo real, con estados visuales y tiempos de preparación."
                },
                sync: {
                    title: "Sincroniza a Todo el Equipo",
                    description: "Meseros, cocina y administración trabajan sobre la misma información, sin duplicaciones."
                },
                independence: {
                    title: "Independencia de Cada Local",
                    description: "Cada restaurante mantiene su operación, productos y precios, dentro de una plataforma común."
                },
                visibility: {
                    title: "Visibilidad y Control",
                    description: "Visualiza pedidos activos, tiempos de preparación y estado de las órdenes en tiempo real."
                },
                scale: {
                    title: "Escala con el Crecimiento",
                    description: "Incorpora progresivamente pagos digitales, integración con marketplaces, control de inventarios y logística."
                }
            }
        }
    },
    signup: {
        title: "Crea Tu Cuenta",
        accountInformation: "Información de la Cuenta",
        
        // Form fields
        email: "Correo Electrónico",
        businessName: "Nombre de la Empresa",
        firstName: "Nombre",
        lastName: "Apellido",
        password: "Contraseña",
        confirmPassword: "Confirmar Contraseña",
        contactPhone: "Teléfono de Contacto",
        rut: "RUT",
        preferredLanguage: "Idioma Preferido",
        preferredCurrency: "Moneda Preferida",
        preferredTimezone: "Zona Horaria",
        
        // Buttons and actions
        continueWithGoogle: "Continuar con Google",
        connecting: "Conectando...",
        createAccountStartTrial: "Crear Cuenta e Iniciar Prueba",
        creatingAccount: "Creando Cuenta...",
        cancel: "Cancelar",
        
        // Messages
        orSignUpWithEmail: "o regístrate con correo electrónico",
        termsOfService: "Términos de Servicio",
        privacyPolicy: "Política de Privacidad",
        byCreatingAccount: "Al crear una cuenta, aceptas nuestros",
        and: "y",
        
        // Validation messages
        emailRequired: "El correo electrónico es obligatorio",
        invalidEmail: "Dirección de correo electrónico inválida",
        businessNameRequired: "El nombre de la empresa es obligatorio",
        rutRequired: "El RUT es obligatorio",
         publicIdLabel: "RUT Empresa",
        invalidRut: "RUT inválido",
        firstNameRequired: "El nombre es obligatorio",
        lastNameRequired: "El apellido es obligatorio",
        passwordRequired: "La contraseña es obligatoria",
        passwordMinLength: "La contraseña debe tener al menos 8 caracteres",
        confirmPasswordRequired: "Por favor confirma tu contraseña",
        passwordsDoNotMatch: "Las contraseñas no coinciden",
        phoneRequired: "El número de teléfono es obligatorio",
        
        // Success and error messages
        accountCreatedSuccess: "¡Bienvenido! Te has suscrito al periodo de prueba de 30 días de KitchnTabs. Por favor revisa tu correo electrónico para verificar tu cuenta.",
        errorOccurred: "Ocurrió un error, por favor intenta de nuevo",
        registrationError: "Ocurrió un error durante el registro",
        googleSignupDisabled: "El registro con Google está actualmente deshabilitado",
        googleAuthError: "Error con la autenticación de Google",
        
        // Dialog titles
        error: "Error",
        
        success: {
            title: "¡Cuenta Creada Exitosamente!",
            welcome: "¡Bienvenido! Tu cuenta ha sido creada y te has suscrito al plan %{planName}.",
            verificationSent: "Hemos enviado un correo de verificación a %{email}. Por favor revisa tu bandeja de entrada y haz clic en el enlace de verificación para activar tu cuenta.",
            description: "Ahora puedes iniciar sesión en tu cuenta y comenzar a usar todas las funciones incluidas en tu plan.",
            loginButton: "Ir a Iniciar Sesión",
            homeButton: "Volver al Inicio",
            home_button:"Volver al Inicio"
        },
        
        verify: {
            title: "Verificación de Cuenta",
            verifying: "Verificando cuenta...",
            invalidLink: "Link de verificación inválido.",
            success: "Cuenta verificada correctamente. Redirigiendo al login...",
            alreadyVerified: "Cuenta ya verificada. Redirigiendo al login...",
            error: "Error al verificar la cuenta. Por favor, intente nuevamente.",
            redirecting: "Redirigiendo al login..."
        },
        
        login: {
            title: "Ingresar",
            email: "Email",
            password: "Contraseña",
            submit: "Ingresar",
            resetPassword: "Resetear contraseña",
            invalidCredentials: "Credenciales inválidas",
            invalidEmail: "Email inválido",
            invalidPassword: "Contraseña Inválida",
            loading: "Cargando...",
            alreadyLoggedIn: "Ya se encuentra logueado",
            goHome: "Ir al Inicio"
        }
    },

    // Menu Items
    menu: {
        home: "Inicio",
        plans: "Planes",
        about: "Acerca de",
        contact: "Contacto",
        download: "Descargar",
        features: "Características"
    },

    // Plans Page
    plans: {
        title: "Elige Tu Plan",
        subtitle: "Comienza tu prueba gratuita hoy. No se requiere tarjeta de crédito.",
        getStarted: "Comenzar",
        footer: "Todos los planes incluyen un período de prueba gratuito. Cancela en cualquier momento.",
        loading: "Cargando planes...",
        error: "Error al cargar los planes de suscripción. Por favor intenta de nuevo más tarde.",
        noPlans: "No hay planes disponibles en este momento.",
        popular: "Más Popular",
        selected: "Seleccionado",
        trialDays: "%{days} días de prueba gratis",
        
        // Plan names by slug
        planNames: {
            "free-trial": "Prueba Gratis",
            "basic-plan": "Plan Básico",
            "professional-plan": "Plan Profesional",
            "enterprise-plan": "Plan Empresarial"
        },
        
        // Plan descriptions by slug
        planDescriptions: {
            "free-trial": "Prueba gratuita de 30 días con funciones básicas",
            "basic-plan": "Perfecto para individuos y equipos pequeños",
            "professional-plan": "Funciones avanzadas para negocios en crecimiento",
            "enterprise-plan": "Solución completa para grandes organizaciones"
        },
        
        // Feature translations
        features: {
            basic_features: "Funciones básicas",
            email_support: "Soporte por email",
            one_store: "1 tienda",
            three_users: "3 usuarios",
            fifty_products: "50 productos",
            unlimited_stores: "Tiendas ilimitadas",
            unlimited_users: "Usuarios ilimitados",
            unlimited_products: "Productos ilimitados",
            priority_support: "Soporte prioritario",
            advanced_analytics: "Análisis avanzados",
            custom_domain: "Dominio personalizado",
            api_access: "Acceso a API",
            white_label: "Marca blanca"
        },
        
        // Billing cycles
        billingCycle: {
            daily: "por día",
            weekly: "por semana",
            monthly: "por mes",
            yearly: "por año",
            daily_short: "/día",
            weekly_short: "/sem",
            monthly_short: "/mes",
            yearly_short: "/año"
        },
    },

    // Gestión de Cuenta de Tenancy
    tenancy_account: {
        management: {
            title: "Gestión de Cuenta",
            delete: {
                title: "Eliminar Cuenta",
                description: "Elimina permanentemente tu cuenta y todos los datos asociados. Esta acción no se puede deshacer.",
                button: "Eliminar Cuenta",
                dialog: {
                    title: "Eliminar Cuenta",
                    warning_title: "Advertencia: Esta acción es irreversible",
                    warning_content: "Eliminar tu cuenta:",
                    warning_items: {
                        disable: "Deshabilitará tu cuenta inmediatamente",
                        schedule: "Programará la eliminación permanente después de %{days} días",
                        delete_users: "Eliminará todos los usuarios asociados a esta cuenta",
                        delete_tenants: "Eliminará todas las tiendas/locales que administras",
                        delete_products: "Eliminará todos los productos e inventario",
                        delete_subscriptions: "Cancelará todas las suscripciones activas",
                        delete_data: "Borrará permanentemente todos tus datos"
                    },
                    confirm_instruction: "Escribe ELIMINAR para confirmar:",
                    confirm_word: "ELIMINAR",
                    cancel: "Cancelar",
                    confirm: "Eliminar Mi Cuenta"
                },
                success: "Eliminación de cuenta iniciada. Recibirás un correo de confirmación.",
                error: "Error al iniciar la eliminación de cuenta. Por favor intenta de nuevo.",
                cannot_delete: "No se puede eliminar la cuenta en este momento. Por favor contacta a soporte."
            },
            pending_deletion: {
                title: "Cuenta Pendiente de Eliminación",
                description: "Tu cuenta está programada para eliminación permanente el %{date}.",
                cancel_button: "Cancelar Eliminación",
                cancel_success: "La eliminación de la cuenta ha sido cancelada.",
                cancel_error: "Error al cancelar la eliminación. Por favor intenta de nuevo."
            },
            export: {
                title: "Exportar Tus Datos",
                description: "Descarga una copia de todos los datos de tu cuenta en un formato portable.",
                button: "Solicitar Exportación de Datos",
                requesting: "Solicitando exportación...",
                success: "Exportación de datos solicitada. Recibirás un correo cuando esté lista.",
                error: "Error al solicitar la exportación de datos. Por favor intenta de nuevo.",
                history: {
                    title: "Historial de Exportaciones",
                    no_exports: "Sin exportaciones de datos aún.",
                    status: {
                        pending: "Pendiente",
                        processing: "Procesando",
                        completed: "Completado",
                        failed: "Fallido",
                        expired: "Expirado"
                    },
                    download: "Descargar",
                    expires: "Expira: %{date}",
                    expired_message: "Esta exportación ha expirado"
                }
            }
        }
    },

    // Traducciones de lista de cuentas
    account: {
        no_accounts: "Sin cuentas",
        email_label: "Correo electrónico",
        created_label: "Creado",
        updated_label: "Actualizado",
        trial_ends_label: "Prueba termina",
        plan_label: "Plan",
        trial_days_left: "Días de prueba restantes",
    }
};

export default customEs;

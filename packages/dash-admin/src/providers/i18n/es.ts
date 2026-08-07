import raSpanish from 'ra-language-spanish';

const dashSpanish = {
	ra: {
		action: {
			add: 'Añadir',
			add_filter: 'Añadir filtro',
			back: 'Ir atrás',
			bulk_actions:
				'1 item seleccionado |||| %{smart_count} items seleccionados',
			cancel: 'Cancelar',
			clear_input_value: 'Limpiar valor',
			clone: 'Clonar',
			close: 'Cerrar',
			close_menu: 'Cerrar menú',
			confirm: 'Confirmar',
			create: 'Crear',
			create_item: 'Crear %{item}',
			delete: 'Eliminar',
			edit: 'Editar',
			expand: 'Expandir',
			export: 'Exportar',
			list: 'Listar',
			move_up: 'Mover arriba',
			move_down: 'Mover abajo',
			open_menu: 'Abrir menú',
			refresh: 'Refrescar',
			remove: 'Borrar',
			remove_filter: 'Borrar filtro',
			save: 'Guardar',
			search: 'Buscar',
			select_all: 'Seleccionar todo',
			select_row: 'Seleccionar esta fila',
			show: 'Mostrar',
			sort: 'Ordenar',
			undo: 'Deshacer',
			unselect: 'Deseleccionar',
			update: 'Actualizar',
		},
		auth: {
			auth_check_error: 'Por favor inicie sesión para continuar',
			logout: 'Cerrar Sesión',
			password: 'Contraseña',
			sign_in: 'Acceder',
			sign_in_error: 'La autenticación falló, por favor, vuelva a intentarlo',
			user_menu: 'Perfil',
			username: 'Usuario',
		},
		boolean: {
			true: 'Sí',
			false: 'No',
			null: ' ',
		},
		input: {
			file: {
				upload_several:
					'Arrastre algunos archivos para subir o haga clic para seleccionarlos.',
				upload_single:
					'Arrastre un archivo para subir o haga clic para seleccionarlo.',
			},
			image: {
				upload_several:
					'Arrastre algunas imagénes para subir o haga clic para seleccionarlas.',
				upload_single:
					'Arrastre alguna imagen para subir o haga clic para seleccionarla.',
			},
			references: {
				all_missing: 'No se pueden encontrar datos de referencias.',
				many_missing:
					'Al menos una de las referencias asociadas parece no estar disponible.',
				single_missing: 'La referencia asociada no parece estar disponible.',
			},
			password: {
				toggle_visible: 'Ocultar contraseña',
				toggle_hidden: 'Mostrar contraseña',
			},
		},
		message: {
			about: 'Acerca de',
			are_you_sure: '¿Está seguro?',
			bulk_delete_content:
				'¿Seguro que quiere eliminar este %{name}? |||| ¿Seguro que quiere eliminar estos %{smart_count} items?',
			bulk_delete_title:
				'Eliminar %{name} |||| Eliminar %{smart_count} %{name} items',
			bulk_update_content:
				'¿Seguro que quiere actualizar este %{name}? |||| ¿Seguro que quiere actualizar estos %{smart_count} items?',
			bulk_update_title:
				'Actualizar %{name} |||| Actualizar %{smart_count} %{name} items',
			delete_content: '¿Seguro que quiere eliminar este item?',
			delete_title: 'Eliminar %{name} #%{id}',
			details: 'Detalles',
			error:
				'Se produjo un error en el cliente y su solicitud no se pudo completar',
			invalid_form:
				'El formulario no es válido. Por favor verifique si hay errores',
			loading: 'La página se está cargando, espere un momento por favor',
			no: 'No',
			not_found:
				'O bien escribió una URL incorrecta o siguió un enlace incorrecto.',
			yes: 'Sí',
			unsaved_changes:
				'Algunos de sus cambios no se guardaron. ¿Está seguro que quiere ignorarlos?',
		},
		navigation: {
			next: 'Siguiente',
			no_more_results:
				'El número de página %{page} está fuera de los límites. Pruebe la página anterior.',
			no_results: 'No se han encontrado resultados',
			page_out_from_begin: 'No puede ir antes de la página 1',
			page_out_from_end: 'No puede ir después de la última página',
			page_out_of_boundaries: 'Número de página %{page} fuera de los límites',
			page_range_info: '%{offsetBegin} - %{offsetEnd} de %{total}',
			page_rows_per_page: 'Filas por página:',
			prev: 'Anterior',
			skip_nav: 'Saltar al contenido',
		},
		sort: {
			sort_by: 'Ordenar por %{field} %{order}',
			asc: 'ascendente',
			desc: 'descendente',
			DESC: 'descendente',
			ASC: 'ascendente',
		},
		notification: {
			bad_item: 'Elemento incorrecto',
			canceled: 'Acción cancelada',
			created: 'Elemento creado',
			data_provider_error:
				'Error del proveedor de datos. Consulte la consola para más detalles.',
			deleted: 'Elemento borrado |||| %{smart_count} elementos borrados.',
			http_error: 'Error de comunicación con el servidor',
			item_doesnt_exist: 'El elemento no existe',
			logged_out: 'Su sesión ha finalizado, vuelva a conectarse.',
			updated:
				'Elemento actualizado |||| %{smart_count} elementos actualizados',
			i18n_error:
				'No se pudieron cargar las traducciones para el idioma especificado',
			not_authorized: 'No tiene autorización para acceder a este recurso.',
		},
		page: {
			create: 'Crear %{name}',
			dashboard: 'Tablero',
			edit: '%{name} #%{id}',
			empty: 'No existen %{name} todavía.',
			error: 'Algo salió mal',
			invite: '¿Quiere agregar uno?',
			list: 'Lista de %{name}',
			loading: 'Cargando',
			not_found: 'No encontrado',
			show: '%{name} #%{id}',
		},
		validation: {
			email: 'Debe ser un correo electrónico válido',
			maxLength: 'Debe contener %{max} caracteres o menos',
			maxValue: 'Debe ser %{max} o menos',
			minLength: 'Debe contener %{min} caracteres al menos',
			minValue: 'Debe ser al menos %{min}',
			number: 'Debe ser un número',
			oneOf: 'Debe ser uno de: %{options}',
			regex: 'Debe coincidir con un formato específico (regexp): %{pattern}',
			required: 'Requerido',
		},
	},
	simple: {
		action: {
			close: 'Cerrar',
			resetViews: 'Resetear',
		},
		'create-post': 'Neuvo Post',
	},
	resources: {
		posts: {
			name: 'Post |||| Posts',
			fields: {
				average_note: 'Nota promedio',
				body: 'Contenido',
				comments: 'Comentarios',
				commentable: 'Comentable',
				commentable_short: 'Com.',
				created_at: 'Creado el',
				notifications: 'Destinatarios de notificaciones',
				nb_view: 'Num vistas',
				password: 'Contraseña (si el post está protegido)',
				pictures: 'Imágenes relacionadas',
				published_at: 'Publicado el',
				teaser: 'Avance',
				tags: 'Etiquetas',
				title: 'Título',
				views: 'Vistas',
				authors: 'Autores',
			},
		},
		comments: {
			name: 'Comentario |||| Comentarios',
			fields: {
				body: 'Contenido',
				created_at: 'Creado el',
				post_id: 'Posts',
				author: {
					name: 'Autor',
				},
			},
		},
		users: {
			name: 'Usuario |||| Usuarios',
			fields: {
				name: 'Nombre',
				role: 'Rol',
			},
		},
	},
	post: {
		list: {
			search: 'Buscar',
		},
		form: {
			summary: 'Resumen',
			body: 'Contenido',
			miscellaneous: 'Otros',
			comments: 'Comentarios',
		},
		edit: {
			title: 'Post "%{title}"',
		},
		action: {
			save_and_edit: 'Guardar y Editar',
			save_and_add: 'Guardar y Añadir',
			save_and_show: 'Guardar y Mostrar',
			save_with_average_note: 'Guardar con Nota',
		},
	},
	comment: {
		list: {
			about: 'Acerca de',
		},
	},
	user: {
		list: {
			search: 'Buscar',
		},
		form: {
			summary: 'Resumen',
			security: 'Seguridad',
		},
		edit: {
			title: 'Usuario "%{title}"',
		},
		action: {
			save_and_add: 'Guardar y Añadir',
			save_and_show: 'Guardar y Mostrar',
		},
	},
	tab: {
		tabs: 'Cuentas',
		kitchen_tabs: 'Órdenes de Cocina',
		action: {
			cancel: 'Cancelar',
			confirm: 'Confirmar',
			print: 'Imprimir',
			pay: 'Pagar',
			close: 'Cerrar',
		},
		status: {
			created: 'Creada',
			confirmed: 'Confirmada',
			preparing: 'Preparando',
			ready: 'Lista',
			delivered: 'Entregada',
			completed: 'Completada',
			cancelled: 'Cancelada',
		},
	},
	kiosk: {
		// Header
		total: 'Total',
		clear_cart: 'Vaciar Carrito',
		view_order: 'Ver Pedido',
		add_items_to_start: 'Agrega productos para comenzar',
		
		// Navigation
		prev: 'Ant',
		next: 'Sig',
		page_of: 'Página %{current} de %{total} • %{items} productos',
		products: 'Productos',
		
		// Product Card
		customizable: 'Personalizable',
		
		// Product Grid
		no_products_found: 'No se encontraron productos en esta categoría',
		
		// Cart View
		your_order: 'Tu Pedido',
		cart_empty: 'Tu carrito está vacío',
		browse_menu: 'Ver Menú',
		note: 'Nota',
		order_options: 'Opciones del Pedido',
		delivery_method: 'Método de Entrega',
		table_number: 'Número de Mesa',
		your_name: 'Tu Nombre (Opcional)',
		special_instructions: 'Instrucciones Especiales (Opcional)',
		cancel_order: 'Cancelar Pedido',
		confirm_order: 'Confirmar Pedido',
		submitting: 'Enviando...',
		
		// Modifier Modal
		select_multiple: 'Selecciona varios',
		required: '*Requerido',
		cancel: 'Cancelar',
		add_to_order: 'Agregar al Pedido',
		
		// Confirmation View
		order_confirmed: '¡Pedido Confirmado!',
		thank_you: 'Gracias por tu pedido. Por favor espera a que llamen tu número.',
		your_order_number: 'Tu Número de Pedido',
		status: 'Estado',
		start_new_order: 'Iniciar Nuevo Pedido',
		auto_reset_notice: 'Esta pantalla se reiniciará automáticamente en 30 segundos',
		loading: 'Cargando...',
	},
	// Service account API keys
	serviceAccount: {
		reveal: {
			title: 'Copia tu API Key ahora',
			warning:
				'Esta es la única vez que se mostrará esta clave. No se puede recuperar más adelante — si la pierdes, tendrás que emitir una nueva.',
			forKey: 'Clave',
			copy: 'Copiar',
			copied: 'Copiado',
			dismiss: 'La he guardado',
		},
		status: {
			active: 'Activa',
			disabled: 'Deshabilitada',
		},
		expiration: {
			'1': '1 día',
			'7': '7 días',
			'30': '30 días',
			never: 'Nunca',
		},
		notify: {
			enabled: 'API Key habilitada',
			disabled: 'API Key deshabilitada',
			toggle_error: 'No se pudo cambiar el estado de la API Key',
		},
		action: {
			enable: 'Habilitar',
			disable: 'Deshabilitar',
		},
		// Shown when a tenancy-level role is selected: such a key reaches every
		// tenant in the account, so the tenant field stops being a boundary.
		tenancy_role_warning:
			'Este rol otorga acceso a todos los locales de la cuenta. El local seleccionado es informativo, no un límite de seguridad.',
	},
	// Resource labels for admin panel
	resource: {
		tenancy: {
			serviceAccounts: {
				label: 'Cuentas de Servicio',
				name: 'Nombre',
				tenant: 'Local',
				roles: 'Roles',
				expiration: 'Expiración',
				status: 'Estado',
				token: 'Clave',
				expires_at: 'Expira',
				last_used_at: 'Último uso',
				created_at: 'Creado',
			},
		},
		// Groups
		groups: {
			system_resources: 'Recursos de Sistema',
			products: 'Productos',
			integrations: 'Integraciones',
			configuration: 'Configuración',
			campaigns: 'Campañas',
			import_export: 'Import/Export',
			cashier: 'Caja',
		},
		// System resources
		system: {
			tenants: {
				label: 'Clientes',
				menu_list: 'Clientes',
				menu_trash: 'Papelera',
				main_action: 'Crear cliente',
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
				main_action: 'Crear usuario',
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
				menu_list: 'Listado de categorías',
				main_action: 'Crear categoría',
				filter_name: 'Nombre',
			},
			brands: {
				label: 'Marcas',
				menu_list: 'Listado de Marcas',
				main_action: 'Crear marca',
			},
			galleries: {
				label: 'Galerías',
				menu_list: 'Listado de galerías',
				main_action: 'Crear galería',
				filter_name: 'Nombre',
			},
			currencies: {
				label: 'Monedas',
				menu_list: 'Listado de monedas',
				main_action: 'Crear moneda',
			},
			pricelists: {
				label: 'Lista de Precio',
				menu_list: 'Lista de Precios',
				main_action: 'Crear lista de precio',
			},
			modifiers: {
				label: 'Grupos de Modificadores',
				menu_list: 'Listado de modificadores',
				main_action: 'Crear grupo de modificadores',
				filter_name: 'Nombre',
				filter_selection_mode: 'Modo de selección',
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
				menu_list: 'Cliente Módulo Ecommerce',
			},
			users: {
				label: 'Usuarios',
			},
		},
		// Campaigns
		campaigns: {
			label: 'Campañas',
			menu_list: 'Listado de Campañas',
			main_action: 'Crear',
			filter_name: 'Nombre',
		},
		// Import/Export
		import: {
			templates: {
				label: 'Plantillas de importación',
				menu_list: 'Plantillas',
				main_action: 'Crear Plantilla',
			},
			instances: {
				label: 'Importar Productos',
				menu_list: 'Importaciones',
				main_action: 'Crear Importación',
			},
		},
		// Mall resources
		mall: {
			label: 'Centro Comercial',
			menu_list: 'Listado',
			main_action: 'Crear Centro Comercial',
		},
		// Cash Count resources
		cashcount: {
			label: 'Arqueos de Caja',
			menu_list: 'Arqueos de Caja',
			main_action: 'Nuevo Arqueo',
			filter_status: 'Estado',
			filter_period_start: 'Período Desde',
			filter_period_end: 'Período Hasta',
		},
	},
	mall: {
		// Store Selector
		all_stores: 'Todas las Tiendas',
		select_store: 'Selecciona una tienda',
		all: 'Todos',
		
		// Assistance
		request_assistance: 'Solicitar Asistencia',
		assistance_sent: 'Solicitud de asistencia enviada',
		assistance_error: 'Error al enviar solicitud de asistencia',
		select_store_first: 'Selecciona una tienda primero',
		assistance_requested: 'Asistencia solicitada',
		assistance_rate_limit: 'Has solicitado asistencia recientemente, espera un momento',
		
		// Search
		search_products: 'Buscar productos...',
		
		// Product Grid
		no_products_found: 'No se encontraron productos',
		try_different_store_or_search: 'Intenta seleccionar otra tienda o ajustar tu búsqueda',
		featured: 'Destacado',
		add: 'Agregar',
		
		// Pagination
		display_mode: 'Vista',
		horizontal_pagination: 'Mostrar productos en páginas',
		infinite_scroll: 'Mostrar todos los productos en scroll',
		pages: 'Páginas',
		scroll: 'Scroll',
		prev: 'Ant',
		next: 'Sig',
		
		// Cart Summary
		cart_empty: 'Tu carrito está vacío',
		view_cart: 'Ver Carrito',
		item: 'producto',
		items: 'productos',
		stores: 'tiendas',
		
		// Cart Drawer
		your_order: 'Tu Pedido',
		add_products_to_continue: 'Agrega productos para continuar',
		unknown_store: 'Tienda Desconocida',
		clear_cart: 'Vaciar Carrito',
		total: 'Total',
		confirm_order: 'Confirmar Pedido',
		submit_order: 'Enviar Pedido',
		submitting_order: 'Enviando...',
		continue_shopping: 'Seguir Comprando',
		product_added: 'Producto agregado al carrito',
		product_added_with_name: '%{name} agregado al carrito',
		product_updated: 'Producto actualizado',
		
		// Cart Item Actions
		edit_item: 'Editar producto',
		remove_item: 'Eliminar producto',
		update_item: 'Actualizar',
		add_to_cart: 'Agregar al Carrito',
		
		// Product Modifiers Modal
		required: 'Requerido',
		select_up_to: 'Selecciona hasta %{count}',
		special_instructions: 'Instrucciones especiales',
		special_instructions_placeholder: 'Ej: sin cebolla, extra salsa, etc.',
		
		// Product Grid
		all_products: 'Todos los Productos',
		has_modifiers: 'Personalizable',
		no_more_products: 'No hay más productos',
	},
	// JSON Color Selector - extracción de tema desde imagen
	colorSelector: {
		imageExtractor: {
			title_ai: 'Generador de Tema con IA',
			title_local: 'Tema desde Imagen',
			upload_prompt: 'Sube una Imagen para Extraer Colores',
			upload_hint: 'Selecciona un archivo de imagen y extraeremos automáticamente una paleta de colores',
			upload_button: 'Elegir Imagen',
			drop_hint: 'o arrástrala aquí',
			invalid_file_type: 'Por favor selecciona un archivo de imagen válido',
			file_too_large: 'El archivo debe pesar menos de %{limit}MB',
			extracting: 'Extrayendo colores de la imagen...',
			extracted_colors: 'Colores Extraídos (%{count} colores encontrados)',
			dominant_label: 'Dominante',
			uploaded_image_alt: 'Imagen subida',
			no_palette_error: 'Primero extrae los colores de una imagen',
			theme_generation_failed: 'No se pudo generar el tema',
			theme_description_label: 'Descripción del Tema (Opcional)',
			theme_description_placeholder:
				"Opcional: Describe el estilo de tema que deseas (ej: 'moderno y minimalista', 'cálido y acogedor', 'corporativo profesional')",
			apply_colors_button: 'Aplicar Colores',
			generate_button: 'Generar Tema con IA',
			generating_button: 'Generando...',
			apply_colors_help_label: 'Aplicar Colores:',
			apply_colors_help_desc:
				'Aplica la paleta extraída a los colores base de tu tema localmente — sin usar IA',
			generate_help_label: 'Generar Tema con IA:',
			generate_help_desc:
				'Usa IA para crear un esquema de color completo basado en los colores extraídos y tu descripción',
		},
	},
	// Profile page
	profile: {
		title: 'Perfil',
		subtitle: 'Configuración de perfil',
		info: {
			title: 'Info',
			name: 'Nombre',
			lastname: 'Apellido',
			email: 'Email',
			save: 'Guardar',
			saving: 'Guardando...',
		},
		password: {
			title: 'Contraseñas',
			current: 'Contraseña actual',
			new: 'Nueva contraseña',
			confirm: 'Repita nueva contraseña',
			save: 'Guardar Contraseñas',
			saving: 'Guardando Contraseñas...',
		},
		preferences: {
			title: 'Preferencias',
		},
		validation: {
			required: 'El campo es requerido',
			password_mismatch: 'Las contraseñas no coinciden',
		},
		notify: {
			success: 'Usuario actualizado correctamente',
			error: 'Error al actualizar el usuario',
			error_with_message: 'Error al actualizar el usuario, %{message}',
		},
	},
};

export default {
    ...raSpanish,
	...dashSpanish
};

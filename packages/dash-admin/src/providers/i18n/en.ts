import raEnglish from 'ra-language-english';

const dashEnglish = {
	ra: {
		action: {
			add: 'Add',
			add_filter: 'Add filter',
			back: 'Go back',
			bulk_actions:
				'1 item selected |||| %{smart_count} items selected',
			cancel: 'Cancel',
			clear_input_value: 'Clear value',
			clone: 'Clone',
			close: 'Close',
			close_menu: 'Close menu',
			confirm: 'Confirm',
			create: 'Create',
			create_item: 'Create %{item}',
			delete: 'Delete',
			edit: 'Edit',
			expand: 'Expand',
			export: 'Export',
			list: 'List',
			move_up: 'Move up',
			move_down: 'Move down',
			open_menu: 'Open menu',
			refresh: 'Refresh',
			remove: 'Remove',
			remove_filter: 'Remove filter',
			save: 'Save',
			search: 'Search',
			select_all: 'Select all',
			select_row: 'Select this row',
			show: 'Show',
			sort: 'Sort',
			undo: 'Undo',
			unselect: 'Unselect',
			update: 'Update',
		},
		auth: {
			auth_check_error: 'Please login to continue',
			logout: 'Logout',
			password: 'Password',
			sign_in: 'Sign in',
			sign_in_error: 'Authentication failed, please try again',
			user_menu: 'Profile',
			username: 'Username',
		},
		boolean: {
			true: 'Yes',
			false: 'No',
			null: ' ',
		},
		input: {
			file: {
				upload_several:
					'Drop some files to upload, or click to select them.',
				upload_single:
					'Drop a file to upload, or click to select it.',
			},
			image: {
				upload_several:
					'Drop some images to upload, or click to select them.',
				upload_single:
					'Drop an image to upload, or click to select it.',
			},
			references: {
				all_missing: 'Unable to find reference data.',
				many_missing:
					'At least one of the associated references appears to be unavailable.',
				single_missing: 'Associated reference appears to be unavailable.',
			},
			password: {
				toggle_visible: 'Hide password',
				toggle_hidden: 'Show password',
			},
		},
		message: {
			about: 'About',
			are_you_sure: 'Are you sure?',
			bulk_delete_content:
				'Are you sure you want to delete this %{name}? |||| Are you sure you want to delete these %{smart_count} items?',
			bulk_delete_title:
				'Delete %{name} |||| Delete %{smart_count} %{name} items',
			bulk_update_content:
				'Are you sure you want to update this %{name}? |||| Are you sure you want to update these %{smart_count} items?',
			bulk_update_title:
				'Update %{name} |||| Update %{smart_count} %{name} items',
			delete_content: 'Are you sure you want to delete this item?',
			delete_title: 'Delete %{name} #%{id}',
			details: 'Details',
			error:
				'A client error occurred and your request could not be completed',
			invalid_form:
				'The form is not valid. Please check for errors',
			loading: 'The page is loading, please wait',
			no: 'No',
			not_found:
				'Either you typed a wrong URL or you followed a bad link.',
			yes: 'Yes',
			unsaved_changes:
				'Some of your changes were not saved. Are you sure you want to ignore them?',
		},
		navigation: {
			next: 'Next',
			no_more_results:
				'Page number %{page} is out of boundaries. Try the previous page.',
			no_results: 'No results found',
			page_out_from_begin: 'Cannot go before page 1',
			page_out_from_end: 'Cannot go after last page',
			page_out_of_boundaries: 'Page number %{page} is out of boundaries',
			page_range_info: '%{offsetBegin} - %{offsetEnd} of %{total}',
			page_rows_per_page: 'Rows per page:',
			prev: 'Previous',
			skip_nav: 'Skip to content',
		},
		sort: {
			sort_by: 'Sort by %{field} %{order}',
			asc: 'ascending',
			desc: 'descending',
			DESC: 'descending',
			ASC: 'ascending',
		},
		notification: {
			bad_item: 'Incorrect element',
			canceled: 'Action canceled',
			created: 'Element created',
			data_provider_error:
				'Data provider error. Check the console for details.',
			deleted: 'Element deleted |||| %{smart_count} elements deleted',
			http_error: 'Server communication error',
			item_doesnt_exist: 'Element does not exist',
			logged_out: 'Your session has ended, please reconnect.',
			updated:
				'Element updated |||| %{smart_count} elements updated',
			i18n_error:
				'Could not load translations for the specified language',
			not_authorized: 'You are not authorized to access this resource.',
		},
		page: {
			create: 'Create %{name}',
			dashboard: 'Dashboard',
			edit: '%{name} #%{id}',
			empty: 'No %{name} yet.',
			error: 'Something went wrong',
			invite: 'Would you like to add one?',
			list: '%{name} List',
			loading: 'Loading',
			not_found: 'Not Found',
			show: '%{name} #%{id}',
		},
		validation: {
			email: 'Must be a valid email',
			maxLength: 'Must be %{max} characters or less',
			maxValue: 'Must be %{max} or less',
			minLength: 'Must be at least %{min} characters',
			minValue: 'Must be at least %{min}',
			number: 'Must be a number',
			oneOf: 'Must be one of: %{options}',
			regex: 'Must match a specific format (regexp): %{pattern}',
			required: 'Required',
		},
	},
	simple: {
		action: {
			close: 'Close',
			resetViews: 'Reset',
		},
		'create-post': 'New Post',
	},
	resources: {
		posts: {
			name: 'Post |||| Posts',
			fields: {
				average_note: 'Average note',
				body: 'Content',
				comments: 'Comments',
				commentable: 'Commentable',
				commentable_short: 'Com.',
				created_at: 'Created at',
				notifications: 'Notification recipients',
				nb_view: 'Num views',
				password: 'Password (if post is protected)',
				pictures: 'Related Pictures',
				published_at: 'Published at',
				teaser: 'Teaser',
				tags: 'Tags',
				title: 'Title',
				views: 'Views',
				authors: 'Authors',
			},
		},
		comments: {
			name: 'Comment |||| Comments',
			fields: {
				body: 'Content',
				created_at: 'Created at',
				post_id: 'Posts',
				author: {
					name: 'Author',
				},
			},
		},
		users: {
			name: 'User |||| Users',
			fields: {
				name: 'Name',
				role: 'Role',
			},
		},
	},
	post: {
		list: {
			search: 'Search',
		},
		form: {
			summary: 'Summary',
			body: 'Content',
			miscellaneous: 'Miscellaneous',
			comments: 'Comments',
		},
		edit: {
			title: 'Post "%{title}"',
		},
		action: {
			save_and_edit: 'Save and Edit',
			save_and_add: 'Save and Add',
			save_and_show: 'Save and Show',
			save_with_average_note: 'Save with Note',
		},
	},
	comment: {
		list: {
			about: 'About',
		},
	},
	user: {
		list: {
			search: 'Search',
		},
		form: {
			summary: 'Summary',
			security: 'Security',
		},
		edit: {
			title: 'User "%{title}"',
		},
		action: {
			save_and_add: 'Save and Add',
			save_and_show: 'Save and Show',
		},
	},
	tab: {
		tabs: 'Tabs',
		kitchen_tabs: 'Kitchen Orders',
		action: {
			cancel: 'Cancel',
			confirm: 'Confirm',
			print: 'Print',
			pay: 'Pay',
			close: 'Close',
		},
		status: {
			created: 'Created',
			confirmed: 'Confirmed',
			preparing: 'Preparing',
			ready: 'Ready',
			delivered: 'Delivered',
			completed: 'Completed',
			cancelled: 'Cancelled',
		},
	},
	kiosk: {
		// Header
		total: 'Total',
		clear_cart: 'Clear Cart',
		view_order: 'View Order',
		add_items_to_start: 'Add items to start',
		
		// Navigation
		prev: 'Prev',
		next: 'Next',
		page_of: 'Page %{current} of %{total} • %{items} items',
		products: 'Products',
		
		// Product Card
		customizable: 'Customizable',
		
		// Product Grid
		no_products_found: 'No products found in this category',
		
		// Cart View
		your_order: 'Your Order',
		cart_empty: 'Your cart is empty',
		browse_menu: 'Browse Menu',
		note: 'Note',
		order_options: 'Order Options',
		delivery_method: 'Delivery Method',
		table_number: 'Table Number',
		your_name: 'Your Name (Optional)',
		special_instructions: 'Special Instructions (Optional)',
		cancel_order: 'Cancel Order',
		confirm_order: 'Confirm Order',
		submitting: 'Submitting...',
		
		// Modifier Modal
		select_multiple: 'Select multiple',
		required: '*Required',
		cancel: 'Cancel',
		add_to_order: 'Add to Order',
		
		// Confirmation View
		order_confirmed: 'Order Confirmed!',
		thank_you: 'Thank you for your order. Please wait for your number to be called.',
		your_order_number: 'Your Order Number',
		status: 'Status',
		start_new_order: 'Start New Order',
		auto_reset_notice: 'This screen will reset automatically in 30 seconds',
		loading: 'Loading...',
	},
	mall: {
		// Store Selector
		all_stores: 'All Stores',
		select_store: 'Select a store',
		all: 'All',
		
		// Assistance
		request_assistance: 'Request Assistance',
		assistance_sent: 'Assistance request sent',
		assistance_error: 'Failed to send assistance request',
		
		// Search
		search_products: 'Search products...',
		
		// Product Grid
		no_products_found: 'No products found',
		try_different_store_or_search: 'Try selecting a different store or adjusting your search',
		featured: 'Featured',
		add: 'Add',
		
		// Pagination
		display_mode: 'Display',
		horizontal_pagination: 'Show products in pages',
		infinite_scroll: 'Show all products in a scroll',
		pages: 'Pages',
		scroll: 'Scroll',
		prev: 'Prev',
		next: 'Next',
		
		// Cart Summary
		cart_empty: 'Your cart is empty',
		view_cart: 'View Cart',
		item: 'item',
		items: 'items',
		stores: 'stores',
		
		// Cart Drawer
		your_order: 'Your Order',
		add_products_to_continue: 'Add some products to continue',
		unknown_store: 'Unknown Store',
		clear_cart: 'Clear Cart',
		total: 'Total',
		confirm_order: 'Confirm Order',
		submitting_order: 'Submitting...',
		continue_shopping: 'Continue Shopping',
		product_added: 'Product added to cart',
		product_added_with_name: '%{name} added to cart',
		
		// Product Grid
		all_products: 'All Products',
		has_modifiers: 'Customizable',
		no_more_products: 'No more products',
	},
};

export default {
    ...raEnglish,
	...dashEnglish,
};

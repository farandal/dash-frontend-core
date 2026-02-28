import { Product } from "@app/interfaces/ECommerce/Product";

// Interface for modifier option
export interface IModifierOption {
    id: number;
    modifier_group_id: number;
    name: string;
    price_adjustment: string;
    description: string | null;
    is_default: boolean;
    display_order: number;
}

export interface IModifierGroup {
    id: number;
    tenant_id: number;
    name: string;
    type: 'SINGLE' | 'MULTIPLE';
    description: string;
    is_required: boolean;
    min_selections: number;
    max_selections: number | null;
    options: IModifierOption[];
}

export interface ITab {
  id: number;
  tenant_id: number;
  status: string;
  status_localized: string;
  delivery_method: string;
  delivery_method_localized: string;
  note: string | null;
  sale_note_path: string | null;
  order_id: number;
  order_type: string;
  date_created: string;
  date_confirmed: string | null;
  date_in_preparation: string | null;
  date_prepared: string | null;
  date_delivered: string | null;
  date_cancelled: string | null;
  date_closed: string | null;
  created_at: string;
  updated_at: string;
  tenant?: {
    id: number;
    name: string;
    public_id: string;
    public_name: string | null;
    address: string | null;
    phone: string | null;
    mobile: string | null;
    contact_name: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    settings: {
      internal_stock_copy_strategy: boolean;
      auto_republish_errored_products: boolean;
      send_low_stock_alert: boolean;
      use_bsale: boolean;
      auto_reupsert_pos_errored_products: boolean;
      auto_update_marketplace_products: boolean;
    };
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
  };
  order?: {
    id: number;
    tenant_id: number;
    currency_id: number;
    status: string;
    source_id: string;
    subtotal: string | number;
    discount_type: 'percentage' | 'fixed' | null;
    discount_value: string | number | null;
    discount_amount: string | number;
    discount_reason: string | null;
    total_amount: string;
    sale_note_path: string | null;
    tax_document_path: string | null;
    data: any;
    marketplace: {
        id: number;
        name: string;
    };
    date_created: string | null;
    date_confirmed: string | null;
    date_canceled: string | null;
    created_at: string;
    updated_at: string;
    brokerable_type: string;
    brokerable_id: number;
    broker_status: string;
    is_paid: boolean;
    billing_path: string | null;
    billing_ticket_path: string | null;
    pricelist_id: number;
    marketplace_info: {
      id: number;
      name: string;
      type: string;
      brokerable_type: string;
      system_marketplace: {
        id: number;
        name: string;
        class: string;
        icon_url: string;
        icon_path: string;
      };
    };
    items: Array<{
      id: number;
      order_id: number;
      product_id: number;
      product_name: string;
      quantity: number;
      unit_price: string;
      sale_fee: string;
      data: any | null;
      created_at: string;
      updated_at: string;
      itemable_type: string;
      itemable_id: number;
      note: string;
      product: Product & {
        modifier_groups?: Array<{
          id: number;
          tenant_id: number;
          name: string;
          type: string;
          description: string;
          is_required: boolean;
          min_selections: number;
          max_selections: number | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          pivot: {
            product_id: number;
            modifier_group_id: number;
            display_order: number;
            created_at: string;
            updated_at: string;
          };
        }>;
      };
      modifiers: Array<{
        id: number;
        order_product_id: number;
        modifier_option_id: number;
        price_adjustment: string;
        created_at: string;
        updated_at: string;
        modifier_option: {
          id: number;
          modifier_group_id: number;
          name: string;
          price_adjustment: string;
          description: string | null;
          is_default: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          modifier_group: IModifierGroup;
        };
      }>;
    }>;
  };
}

export interface IUberData {


        id: string;
        display_id: string;
        current_state: string;
        store: {
          id: string;
          name: string;
        };
        eater: {
          first_name: string;
          phone: string;
          phone_code: string;
          last_name: string;
        };
        cart: {
          items: Array<{
            id: string;
            title: string;
            external_data: string;
            quantity: number;
            price: {
              unit_price: {
                amount: number;
                currency_code: string;
                formatted_amount: string;
              };
              total_price: {
                amount: number;
                currency_code: string;
                formatted_amount: string;
              };
              base_unit_price: {
                amount: number;
                currency_code: string;
                formatted_amount: string;
              };
              base_total_price: {
                amount: number;
                currency_code: string;
                formatted_amount: string;
              };
            };
            selected_modifier_groups: Array<{
              id: string;
              title: string;
              external_data: string;
              selected_items: Array<{
                id: string;
                title: string;
                external_data: string;
                quantity: number;
                price: {
                  unit_price: {
                    amount: number;
                    currency_code: string;
                    formatted_amount: string;
                  };
                  total_price: {
                    amount: number;
                    currency_code: string;
                    formatted_amount: string;
                  };
                  base_unit_price: {
                    amount: number;
                    currency_code: string;
                    formatted_amount: string;
                  };
                  base_total_price: {
                    amount: number;
                    currency_code: string;
                    formatted_amount: string;
                  };
                };
                selected_modifier_groups: null;
                default_quantity: number;
              }>;
              removed_items: null;
            }> | null;
            instance_id: string;
            eater_id: string;
          }>;
          version_id: string;
          fulfillment_issues: any[];
        };
        payment: {
          charges: {
            total: {
              amount: number;
              currency_code: string;
              formatted_amount: string;
            };
            sub_total: {
              amount: number;
              currency_code: string;
              formatted_amount: string;
            };
          };
        };
        placed_at: string;
        estimated_ready_for_pickup_at: string;
        type: string;
        packaging: {
          disposable_items: {
            should_include: boolean;
          };
        };
        eaters: Array<{
          first_name: string;
          id: string;
        }>;
        brand: string;
        deliveries: any[];
        order_manager_client_id: string;
 };
    


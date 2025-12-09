import Gallery from "../components/Gallery";
import GalleryPrimaryImageSelector from "../components/GalleryPrimaryImageSelector";
import { IDashAutoAdminAttribute } from "dash-auto-admin";


/*
 return [
            'id'       => $this->id,
            'title'     => $this->title,
            'tenant_id'   => $this->tenant_id,
            'tenant'      => $this->whenLoaded('tenant', fn() => TenantResource::make($this->tenant)->resolve()),
            'primary_image_id' =>  $this->primary_image_id,
            'images'      =>  MediaResource::collection($this->getMedia()),
        ];
*/
const gallerySchema: IDashAutoAdminAttribute[] = [
    {
        label: 'Título',
        attribute: 'title',
        type: String
    },
    {
        label: 'Principal',
        attribute: 'primary_image_id',
        listAttribute: 'gallery.primary_image_id',
        type: Number,
        custom: true,
        inList: true,
        
        component: GalleryPrimaryImageSelector
    },
    {
        label: 'Imágenes',
        attribute: 'images',
        type: String,
        custom: true,
        component: Gallery,
        processor: "Null",
        inList: false,
        /*validate: (value, allValues) => {
            console.log(value,allValues);
            return "Error de validación";
        },*/
    }
];

export default gallerySchema;
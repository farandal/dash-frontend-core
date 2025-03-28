import { IDashAutoAdminResourceConfig } from 'dash-auto-admin';
//import ResourceTemplate from 'dash-admin/src/templates/ResourceTemplate';
import ResourceTemplate from "dash-admin/src/templates/ResourceTemplate";
import MapOutlined from '@mui/icons-material/MapOutlined';
import communeFilters from '@app/filters/communeFilters';
import communeSchema from '@app/schemas/common/communeSchema';
import { Card, Grid } from '@mui/material';
import DASHAppConstants from 'dash-constants';


import DASHAdminSystemConstants from 'dash-admin/src/config/DASHAdminSystemConstants';
import { NoResults } from 'dash-admin/src/components/misc/NoResults';
import { PaginationComponent } from 'dash-components';

const communeResource: IDashAutoAdminResourceConfig = {
  filterWithSubmit: true,
  roles: [
    DASHAppConstants.system.SYSTEM_ROLE
  ],
  component: ResourceTemplate,
  trash: true,
  model: 'common/communes',
  label: 'Comunas',
  schema: communeSchema,
  icon: <MapOutlined />,
  group: "Recursos de sistema",
  menu: [
    {
      title: 'Listado de Comunas',
      redirect: '/common/communes',
    },
  ],
  resourceMenuDisabled: false,

  mainAction: {
    title: "Crear comuna",
    mode: "create",
    fn: "virtualhash",
    redirect: "/inline/create",
  },
  drawer: true,
  drawerOptions: {
    create: true,
    edit: true,
    view: true
  },

  referenceFilters: communeFilters,
  toolbarListButton: { enabled: true },
  //listViewButton: { enabled: false },
  // REQUEST REMOVE DRAWERS 
  /*drawer: true,
    listEditButton: {
    enabled: true,
    component: QuickEditButton,
    props: {
      icon: <EditIcon />,
      label: 'Editar',
      resource: 'admin/commune/inline',
      navigate: (id) => id,
      size: 'small',
      color: 'primary',
    },
  },*/
  listEditButton: { enabled: true },
  listViewButton: { enabled: false },
  listProps: { perPage: DASHAdminSystemConstants.system.DEFAULT_PER_PAGE || 50, filterDefaultValues: { status_id: 'Todos' }, empty: false },
  //listDeleteButton: { enabled: false },
  formGroupMode: 'layout', // groups or tabs,
  editLayout: (render) => {
    return (
      <Grid container sx={{ p: 2 }} spacing={3}>
        <Grid item md={12} sx={{ p: 1 }}>
          <strong>Datos comuna</strong>
        </Grid>
        <Grid item md={12} sx={{ p: 1 }}>
          {render('datos')}
        </Grid>
      </Grid>
    )
  },
  mutationMode: 'pessimistic',

  /*exporter: (communes) => {
  const communesForExport = communes.map((commune) => {
    return commune;
  });
  jsonExport(
    communesForExport,
    {
      //headers: ['id', 'title', 'author_name', 'body'] // order fields in the export
    },
    (err, csv) => {
      downloadCSV(csv, 'clientes');
    },
  );
},*/
  customListActions: (props) => {
    const { children } = props;
    return <Card sx={{ mb: 2 }} className='dash-card-content top-toolbar'>{children}</Card>;
  },
  Pagination: PaginationComponent,
  dataGridProps: { stickyHeader: true, empty: <NoResults /> },
  dataGridWrapper: (props) => {
    const { children } = props;
    return (
      <div className='sticky-header-wrapper tableGrid-container'>{children}</div>
    );
  },
};
export default communeResource;

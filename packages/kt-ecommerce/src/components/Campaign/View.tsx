import { FC, useState } from "react";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Button, useRecordContext } from "react-admin";
import { Loading } from "react-admin";
import moment from "moment";
import { useNavigate } from "react-router";
import { useGetList } from "react-admin";
import React from "react";
import { CardHeader, CardContent, Icon } from "@mui/material";
import { Row, Col, Divider, Card } from "antd";
import { Tag } from "react-feather";
import { ArrowForward, ArrowBack, AccessTime } from "@mui/icons-material";
moment.locale("es-es");

const View: FC = ({ ...props }) => {
    const campaign = useRecordContext();
    const [selectedMP, setSelectedMP] = useState(null);
    const daysRemaining = moment(campaign?.end_date, 'YYYY-MM-DD HH:mm:ss').diff(moment(campaign?.start_date, 'YYYY-MM-DD HH:mm:ss'), 'days');
    const navigate = useNavigate();

    const getColoredTag = (status) => {
        let color = '#FF9800';
        let text = 'En espera';
        if(status === 'published') {
            color = '#4CFF4C';
            text = 'Publicado';
        }
        else if(status === 'paused') {
            color = '#4C4C4C';
            text = 'Pausado';
        }
        else if(status === 'finished') {
            color = '#E43961';
            text = 'Finalizado';
        }
        return <Tag color={color} className="ant-tag-rounded">
            {text}
        </Tag>
    }

    if(!campaign)
        return <Loading />

    return (
        <>
            <Row>
                <Col span={12}>
                    <div >
                        <h2 className="dash-page-title">Campañas</h2>
                    </div>
                </Col>
                <Col span={12}>
                    <div className="dash-breadcrumb-btn-container">
                        {selectedMP && <Button className="btn-secondary" onClick={() => navigate(`/campaign/marketplace/${campaign.id}/${selectedMP.id}`)}><span>Editar campaña</span></Button>}
                        <Button><span>Archivar campaña</span></Button>
                    </div>
                </Col>
            </Row>

            <Divider  />
            <Row>
                <Col span={7}>
                    <Card className="dash-card">
                        <CardHeader
                            
                            title={campaign?.name}
                            subheader={getColoredTag(campaign.status)}
                        />
                        <CardContent>
                            <p>
                                {campaign?.description}
                            </p>
                            <div >
                                {selectedMP && <div className="dash-campaign-tag">
                                    <img
                                        src={"/img/default/falabella.png"}
                                        className="dash-campaign-icon"
                                    />
                                    <span>
                                        <strong style={{textTransform: 'capitalize'}}>{selectedMP?.marketplace?.name?.toLowerCase()}</strong>
                                    </span>
                                </div>}
                                <div className="dash-campaign-tag">
                                    <ArrowForward className="dash-campaign-icon" style={{color: "#388E3C", fontSize: "30px"}} />
                                    <span>{moment(campaign?.start_date, 'YYYY-MM-DD HH:mm:ss').format('DD')} de {moment(campaign?.start_date, 'YYYY-MM-DD HH:mm:ss').format('MMMM')} a las {moment(campaign?.start_date, 'YYYY-MM-DD HH:mm:ss').format('HH:mm')}</span>
                                </div>
                                <div className="dash-campaign-tag">
                                    <ArrowBack className="dash-campaign-icon" style={{color: "#F44336", fontSize: "30px"}} />
                                    <span>{moment(campaign?.end_date, 'YYYY-MM-DD HH:mm:ss').format('DD')} de {moment(campaign?.end_date, 'YYYY-MM-DD HH:mm:ss').format('MMMM')} a las  a las {moment(campaign?.end_date, 'YYYY-MM-DD HH:mm:ss').format('HH:mm')}</span>
                                </div>
                                {campaign.status === 'published' && <div className="dash-campaign-tag">
                                    <AccessTime className="dash-campaign-icon" style={{color: "#000000", fontSize: "30px"}} />
                                    <span>Queda{daysRemaining > 1 && 'n'} {daysRemaining} día{daysRemaining > 1 && 's'}</span>
                                </div>}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="dash-card">
                        <CardHeader
                            
                            title='Ver campañas'
                        />
                        <CardContent>
                            <div >
                                {campaign?.campaign_marketplaces?.map((item, key) => (
                                    <div className="dash-campaign-tag" key={key}>
                                        <img
                                            src={"/img/default/falabella.png"}
                                            className="dash-campaign-icon"
                                        />
                                        <button onClick={() => setSelectedMP(item)}>
                                            <strong style={{textTransform: 'capitalize'}}>{item?.marketplace?.name.toLowerCase()}</strong>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </Col>
                <Col span={17}>
                    <Card className="dash-card ">
                        <CardHeader
                            
                            title="Productos de la campaña"
                            subheader={getColoredTag(campaign.status)}
                        />
                        <CardContent className="dash-pt-0">
                            <TableContainer component={Paper} style={{ boxShadow: "unset" }}>
                                <Table aria-label="simple table" className="dash-campaign-table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Precio oferta</TableCell>
                                            <TableCell align="center">Precio real</TableCell>
                                            <TableCell align="center">SKU</TableCell>
                                            <TableCell align="center">Stock</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {selectedMP ?
                                            <TableCellsData MP={selectedMP}/> :
                                            <TableRow
                                                key={'a'}
                                                sx={{
                                                    "&:last-child td, &:last-child th": { border: 0 },
                                                }}
                                                hover={true}
                                            >
                                                <TableCell align="center" colSpan={4}>Seleccione un marketplace</TableCell>
                                            </TableRow>
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

const TableCellsData = ({ MP }) => {
    const { data: campaignProducts, isLoading: isLoadingCampaignProducts } = useGetList(
        `ecommerce/campaign_marketplace/${MP.id}/products`,
        { /*pagination: false*/},
        { refetchOnWindowFocus: false}
    );

    return <>
        {campaignProducts?.map((item, key) => (
            <TableRow
                key={key}
                sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                }}
                hover={true}
            >
                <TableCell component="th" scope="row">
                    {item.price}
                </TableCell>
                <TableCell align="center">{item.sale_price}</TableCell>
                <TableCell align="center">{item.sku}</TableCell>
                <TableCell align="center">{item.stock}</TableCell>
            </TableRow>
        ))}
        {isLoadingCampaignProducts || !campaignProducts?.length &&
            <TableRow
                key={'a'}
                sx={{
                    "&:last-child td, &:last-child th": { border: 0 },
                }}
                hover={true}
            >
                <TableCell align="center" colSpan={4}>{isLoadingCampaignProducts && 'Cargando...'}{!campaignProducts?.length && 'Sin productos'}</TableCell>
            </TableRow>
            }
    </>
}
export default View;
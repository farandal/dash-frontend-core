import { FC } from "react";
import { Col, Row, Button, Collapse } from "antd";

const Panel = Collapse.Panel;

const BrandsList: FC = ({ ...props }) => {
  return (
    <div className="dash-timeline-box">

      <div className="dash-timeline-content">
        <span className="dash-timeline-title">
          <strong>Glosa de cambios: </strong> 12:36 - 2022/07/28
        </span>
        <span className="dash-timeline-title">
          <strong>Autor: </strong> Javier Achebahia
        </span>
        <Row className="dash-my-3">
          <Col span={8}>
            <span>
              <strong>Acción</strong>
            </span>
          </Col>
          <Col span={16}>
            <span>Actualización de recurso</span>
          </Col>
        </Row>
        <Row className="dash-my-3">
          <Col span={8}>
            <span>Nombre</span>
          </Col>
          <Col span={8}>
            <span>Anterior</span>
          </Col>
          <Col span={8}>
            <span>Nuevo</span>
          </Col>
          <Col span={8}>
            <span>Sku</span>
          </Col>
          <Col span={8}>
            <span>Anterior</span>
          </Col>
          <Col span={8}>
            <span>Nuevo</span>
          </Col>
          <Col span={8}>
            <span>Categoria</span>
          </Col>
          <Col span={8}>
            <span>Anterior</span>
          </Col>
          <Col span={8}>
            <span>Nuevo</span>
          </Col>
        </Row>
        <Collapse
          className="dash-timeline-collapse "
          bordered={false}
          defaultActiveKey={["0"]}
          expandIconPosition={"end"}
        >
          <Panel header="Cambios sobre relaciones" key="1">
            <Row className="dash-mb-3">
              <Col span={24}>
                <span>
                  <strong>Precios</strong>
                </span>
              </Col>
              <Col span={8}>
                <span>Principal</span>
              </Col>
              <Col span={16}>
                <span>$0.00</span>
              </Col>
              <Col span={8}>
                <span>Otros</span>
              </Col>
              <Col span={16}>
                <span>Hay otros cambios de precio</span>
              </Col>
            </Row>
            <Row className="dash-mb-3">
              <Col span={24}>
                <span>
                  <strong>Stocks</strong>
                </span>
              </Col>
              <Col span={8}>
                <span>Principal</span>
              </Col>
              <Col span={16}>
                <span>$0.00</span>
              </Col>
              <Col span={8}>
                <span>Otros</span>
              </Col>
              <Col span={16}>
                <span>Hay otros cambios de precio</span>
              </Col>
            </Row>
            <Row className="dash-mb-3">
              <Col span={24}>
                <span>
                  <strong>Metadata</strong>
                </span>
              </Col>
              <Col span={8}>
                <span>Otros</span>
              </Col>
              <Col span={16}>
                <span>No hay otros cambios de precio</span>
              </Col>
            </Row>
          </Panel>
        </Collapse>
        <Row className="">
          <Col span={24}>
            <Button className="btn-blue btn-min btn-full">
              Ver detalle completo de cambios
            </Button>
          </Col>
          <Col span={24}>
            <Button className="btn-min btn-full">Restaurar</Button>
          </Col>
        </Row>
      </div>
    </div>
  );
};
export default BrandsList;

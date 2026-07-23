# Política de Seguridad

Desde los datos confidenciales de los clientes, hasta la información de pago o simplemente los catálogos de menús e historial de pedidos, nuestros Comerciantes confían en nosotros para mantener sus datos seguros, privados y disponibles cuando los necesiten. Nos tomamos esa responsabilidad muy en serio.

En DashAdmin, mantenemos un sistema de seguridad que:

- **Previene** todo acceso no autorizado;
- **Soporta** monitoreo continuo de vulnerabilidades potenciales; y
- **Adopta** mejoras proactivas continuas para mantenerse al día con las últimas herramientas y amenazas de seguridad.

---

## Protección de Datos

### En Tránsito

Todos los datos de comerciantes y clientes—incluyendo nombres, direcciones de envío y facturación, información de pedidos, datos del menú e información de pago—se transmiten utilizando las mejores prácticas de la industria:

- Utilizamos canales seguros **TLS 1.2 y TLS 1.3**
- Soportamos configuraciones de encriptación de **128 bits y 256 bits**, dependiendo del navegador
- **SSL versión 2 y SSL versión 3 nunca se utilizan** en nuestros sistemas
- Aplicamos estrictamente el uso de protocolos modernos y seguros para proteger la integridad y confidencialidad de los datos

### En Reposo

Utilizamos servidores de **Amazon Web Services (AWS)** para alojar todos los datos de usuarios. Hacemos uso extensivo de sus firewalls integrados y redes privadas virtuales para proteger sus datos contra accesos remotos no autorizados.

- Los centros de datos de AWS se someten a certificaciones anuales para garantizar que cumplan con los más altos estándares de seguridad física y virtual
- Todos los datos almacenados están encriptados usando encriptación AES-256
- Las credenciales de base de datos y claves API se almacenan en AWS Secrets Manager

Puede leer más sobre las [prácticas de seguridad de AWS](https://aws.amazon.com/security/).

---

## Confiabilidad de los Datos

Todos los datos de usuarios se respaldan automáticamente en servidores AWS con múltiples copias redundantes:

- **Respaldos automáticos diarios** de todos los datos del sistema
- **Respaldos incrementales por hora** de bases de datos críticas
- Los respaldos se almacenan en **múltiples Zonas de Disponibilidad (A-Z)**
- **Copias de respaldo adicionales fuera del sitio** retenidas por al menos 30 días
- La actividad del usuario y el acceso a los respaldos se registra para fines de auditoría bajo **AWS CloudTrail**
- Pruebas regulares de restauración de respaldos para asegurar las capacidades de recuperación de datos

---

## Privacidad de Datos

Priorizamos la transparencia en cómo recopilamos, usamos y manejamos su información cuando utiliza nuestro sitio web y software.

- Cumplimos con la **Ley 19.628 de Chile** sobre Protección de la Vida Privada
- Seguimos estándares internacionales y mejores prácticas de protección de datos
- Implementamos principios de minimización de datos—solo recopilamos lo que necesitamos

Por favor consulte nuestra [Política de Privacidad](/docs/privacy) completa para más detalles.

---

## Reportar una Vulnerabilidad

Si descubre alguna vulnerabilidad de seguridad en DashAdmin, por favor envíenos un correo a: **security@dashadmin.cl**

Haremos nuestro mejor esfuerzo para solucionarlo de inmediato.

- Damos la bienvenida y apreciamos la divulgación responsable de investigadores de seguridad
- Nos comprometemos a acusar recibo de su reporte de vulnerabilidad dentro de 48 horas
- Le mantendremos informado sobre el progreso de la remediación
- No emprendemos acciones legales contra investigadores que sigan prácticas de divulgación responsable

---

## Controles de Acceso

### Para Comerciantes (Operadores de Restaurantes)

Verificamos el acceso a cuentas de Comerciantes a través de múltiples capas de seguridad:

- **Autenticación basada en OAuth 2.0** con combinación de código-de-tienda/correo/contraseña
- **Autenticación de Dos Factores (2FA)** disponible y altamente recomendada para todos los comerciantes
- Las contraseñas se almacenan usando **hash bcrypt con sales únicas** por usuario
- **Pruebas automatizadas de desafío-respuesta (CAPTCHA)** para prevenir ataques de fuerza bruta e intentos de acceso automatizado
- Gestión de sesiones con tiempo de espera automático para sesiones inactivas
- Monitoreo de intentos de inicio de sesión y bloqueo automático de cuenta después de múltiples intentos fallidos

### Para Clientes (Usuarios Finales)

Verificamos el acceso a cuentas de Clientes a través de:

- **Autenticación basada en correo/contraseña**
- Las contraseñas se almacenan con **sales únicas y hash seguro**
- **Pruebas automatizadas de desafío-respuesta** para prevenir ataques automatizados
- Autenticación opcional sin contraseña mediante enlaces mágicos

### Acceso a Infraestructura

Para la Gestión de Identidad y Acceso a nuestros sistemas de producción, confiamos en **AWS IAM**:

- **Control de acceso basado en roles (RBAC)** con principio de mínimo privilegio
- Privilegios granulares otorgados solo a personal clave
- Autenticación multifactor requerida para todo acceso a infraestructura
- Revisiones regulares de acceso y desaprovisionamiento automático
- Todo acceso registrado y monitoreado

---

## Gestión de Incidentes y Recuperación ante Desastres

Mantenemos procedimientos completos de respuesta a incidentes y recuperación ante desastres:

### Estrategia de Respaldos
- **Respaldos por hora** de todas las bases de datos
- Archivos respaldados automáticamente después de la carga
- Respaldos probados regularmente para integridad
- Almacenados en **múltiples ubicaciones A-Z** más fuera del sitio por al menos **30 días**

### Respuesta a Incidentes
- Practicamos **simulacros de recuperación regulares**
- **Equipo de Infraestructura** dedicado gestiona los procedimientos de incidentes
- Manuales de respuesta a incidentes documentados para varios escenarios
- En caso de un incidente, contactamos al propietario de su cuenta y trabajamos con usted durante toda la resolución

### Continuidad del Negocio
- Capacidad de despliegue multi-región
- Sistemas de conmutación por error automática
- Pruebas regulares de recuperación ante desastres
- Objetivo de Tiempo de Recuperación (RTO) y Objetivo de Punto de Recuperación (RPO) definidos y mantenidos

---

## Auditorías Externas y Cumplimiento

Nos asociamos con expertos en seguridad externos para mantener los más altos estándares de seguridad:

- **Auditorías de seguridad periódicas** realizadas por expertos externos
- Estamos comprometidos a aclarar y resolver cualquier problema relevante encontrado por auditores externos
- Escaneo automatizado de vulnerabilidades y pruebas de penetración
- Revisiones de seguridad de código como parte de nuestro proceso de desarrollo

### Estado de Cumplimiento

Estamos trabajando activamente hacia las siguientes certificaciones:

- ISO 27001 (Gestión de Seguridad de la Información)
- SOC 2 Tipo II (Control de Organización de Servicios)

Para más detalles sobre nuestras prácticas de seguridad o resultados de auditorías pasadas, por favor contacte: **security@dashadmin.cl**

---

## Seguridad de Red

Nuestras medidas de seguridad de red incluyen:

- Protección de **Firewall de Aplicaciones Web (WAF)**
- **Mitigación de DDoS** a través de AWS Shield
- Segmentación y aislamiento de red
- Sistemas de detección y prevención de intrusiones
- Evaluaciones regulares de vulnerabilidades
- Monitoreo continuo de seguridad y alertas

---

## Seguridad de Aplicaciones

Seguimos prácticas de desarrollo seguro:

- **Ciclo de Vida de Desarrollo de Software Seguro (SSDLC)**
- Revisiones regulares de código con enfoque en seguridad
- Escaneo de vulnerabilidades en dependencias
- Validación de entrada y codificación de salida
- Protección contra las vulnerabilidades OWASP Top 10
- Capacitación regular en seguridad para el equipo de desarrollo

---

## Seguridad Física

Nuestra infraestructura está alojada en centros de datos de AWS que proporcionan:

- Personal de seguridad 24/7
- Controles de acceso biométricos
- Vigilancia por video
- Controles ambientales (supresión de incendios, control de clima)
- Conectividad de energía y red redundante

---

## Información de Contacto

Para consultas relacionadas con seguridad o para reportar una vulnerabilidad:

**Correo electrónico:** info+security@dashadmin.cl  
**Soporte General:** info@dashadmin.cl  

---

_Última revisión: 16 de enero de 2026_

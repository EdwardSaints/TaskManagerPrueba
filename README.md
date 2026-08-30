# Task Manager System

Sistema de administracion de tareas para equipos de trabajo desarrollado bajo arquitectura empresarial, con una API en .NET 10 y un cliente responsivo en Angular 20. Todo el entorno se encuentra completamente dockerizado para facilitar el despliegue local rapido.

---

## Tecnologias y Versiones Utilizadas

* Base de Datos: SQL Server 2022 (mcr.microsoft.com/mssql/server:2022-latest)
* Backend: .NET 10 Web API (Clean Architecture)
* ORM: Entity Framework Core 10 (con soporte de insercion sin clausula OUTPUT para compatibilidad con Triggers)
* Frontend: Angular 20 (Zoneless, Signals, Bootstrap 5 + Bootstrap Icons, Chart.js para visualizacion de analiticas)
* Despliegue: Docker Compose

---

## Arquitectura de la Solucion (.NET Clean Architecture)

La API del backend esta estructurada en 5 proyectos basados en la separacion de responsabilidades:

1. TaskManager.Domain: Entidades (User, TaskItem, TaskAudit), Enums (TaskPriority, TaskItemStatus), modelos y contratos de interfaces de repositorios (ITaskRepository, IUserRepository, IUnitOfWork, IReportRepository).
2. TaskManager.Infrastructure: Implementacion de la persistencia de datos mediante Entity Framework Core, DbContext, configuraciones fluidas de base de datos, implementacion de repositorios y del Unit of Work. Maneja el soft delete de forma global.
3. TaskManager.Application: Logica de aplicacion, mapeos de objetos (AutoMapper), validadores de datos (FluentValidation), servicios de negocio (TaskService, ReportService).
4. TaskManager.API: Capa de presentacion REST, controladores expuestos, middleware global de manejo de excepciones y estandarizacion de respuestas HTTP.
5. TaskManager.Tests: Pruebas unitarias para validar las reglas de negocio principales.

---

## Base de Datos (SQL Server)

El esquema de base de datos incluye tres tablas principales y diversas optimizaciones:

* Tablas:
  * Users: Usuarios asignables.
  * Tasks: Tareas con soporte de borrado logico (IsDeleted).
  * TaskAudit: Historial de auditoria para el seguimiento de cambios de estado.
* Indices Optimistas:
  * Indices no agrupados filtrados en Tasks para busquedas eficientes omitiendo tareas eliminadas (IsDeleted = 0).
  * Restriccion unica en Tasks para evitar duplicidad de titulos por usuario.
* Procedimiento Almacenado (sp_GetPendingTasks):
  * Consulta optimizada de agregacion para obtener estadisticas de tareas pendientes y vencidas por usuario.
* Trigger de Auditoria (trg_AuditTaskStatus):
  * Registra de forma automatica en la tabla TaskAudit cada transicion de estado de una tarea (OldStatus -> NewStatus).

---

## Guia de Inicio Rapido con Docker Compose

El entorno incluye toda la infraestructura requerida. Solo se necesita ejecutar un comando para iniciar el sistema:

### Requisitos previos
* Docker Desktop instalado y corriendo en el sistema.

### Instrucciones de despliegue

1. Clonar e ir al directorio raiz del proyecto:
   ```bash
   git clone https://github.com/EdwardSaints/TaskManagerPrueba.git
   cd TaskManagerPrueba
   ```

2. Levantar el entorno de Docker:
   ```bash
   docker-compose up -d --build
   ```
   Esto compilara y levantara:
   * SQL Server en el puerto 1433
   * API Backend en el puerto 5000
   * Frontend Angular en el puerto 4200

3. Inicializar y sembrar la base de datos:
   Debido a las restricciones de seguridad y tiempos de inicializacion de SQL Server en contenedores, ejecute la siembra del esquema inicial mediante el siguiente comando en PowerShell o consola de comandos:
   ```bash
   docker exec -i taskmanager-sqlserver-1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "TaskM@nager2024!" -C -i /docker-entrypoint-initdb.d/init.sql
   ```

4. Acceder a las aplicaciones:
   * Cliente Web (Angular UI): http://localhost:4200
   * Swagger API Documentation: http://localhost:5000/swagger

---

## Lista de Control de Requerimientos Satisfechos

### Backend / API REST
* CRUD completo de Tareas: Endpoint base en /api/tasks.
* Reporte de Tareas Pendientes: Endpoint /api/reports/pending-tasks alimentado por el Stored Procedure sp_GetPendingTasks.
* Filtros Avanzados: Filtrado a nivel de base de datos por prioridad, estado, usuario y rangos de fecha de creacion.
* Paginacion REST: Parametros page y pageSize totalmente implementados.
* Manejo de Errores Estandarizado: Respuestas formales con codigos 200, 201, 400, 404, 409 y 500.

### Validaciones de Negocio
* Titulo obligatorio (maximo 150 caracteres).
* Descripcion opcional (maximo 500 caracteres).
* Fechas coherentes: Al crear una tarea, la fecha limite no puede ser menor a hoy. Al actualizar una tarea vencida, se permite mantener la fecha pero se restringen inconsistencias logicas (ej: fecha fin menor a fecha inicio).
* Titulos uniques: Se restringe la creacion de tareas duplicadas con el mismo titulo asignadas al mismo responsable.

### Frontend (Angular)
* Visualizacion de tareas: Tabla con titulos, prioridades, responsables, estados y fecha limite usando directivas reactivas y diseño moderno.
* Filtros interactivos: Filtro combinado en tiempo real y boton de limpieza de parametros.
* Reportes Graficos: Pestaña de reportes integrada con Chart.js para mostrar:
  1. Comparativa de tareas pendientes vs vencidas por usuario (grafico de barras).
  2. Distribucion de carga de trabajo pendiente del equipo (grafico de dona).
* Indicadores de estado de carga: Interceptor HTTP acoplado a un loading overlay de bloqueo de pantalla y spinners locales en tablas de datos.
* Menu Lateral Moderno: Sidebar colapsable en desktop que se despliega elegantemente mediante hover para ahorrar espacio de pantalla.

-- =================================================================
-- INITIALIZATION SCRIPT FOR TASK MANAGER DB
-- =================================================================
CREATE DATABASE TaskManagerDB;
GO

USE TaskManagerDB;
GO

CREATE TABLE Users (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    IsActive BIT NOT NULL DEFAULT 1
);
GO

CREATE TABLE Tasks (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Title NVARCHAR(150) NOT NULL,
    Description NVARCHAR(500) NULL,
    Priority NVARCHAR(20) NOT NULL,
    Status NVARCHAR(20) NOT NULL,
    StartDate DATETIME2 NULL,
    EndDate DATETIME2 NULL,
    DueDate DATETIME2 NOT NULL,
    CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    UpdatedAt DATETIME2 NULL,
    IsDeleted BIT NOT NULL DEFAULT 0,
    UserId INT NOT NULL,

    CONSTRAINT FK_Tasks_Users FOREIGN KEY (UserId) REFERENCES Users(Id),
    CONSTRAINT CHK_Tasks_Priority CHECK (Priority IN ('Alta', 'Media', 'Baja')),
    CONSTRAINT CHK_Tasks_Status CHECK (Status IN ('Pendiente', 'En progreso', 'Terminada'))
);
GO

CREATE UNIQUE NONCLUSTERED INDEX UQ_Tasks_User_Title 
ON Tasks (UserId, Title)
WHERE IsDeleted = 0;
GO

CREATE TABLE TaskAudit (
    AuditId INT IDENTITY(1,1) PRIMARY KEY,
    TaskId INT NOT NULL,
    OldStatus NVARCHAR(20) NOT NULL,
    NewStatus NVARCHAR(20) NOT NULL,
    ChangedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT FK_TaskAudit_Tasks FOREIGN KEY (TaskId) REFERENCES Tasks(Id)
);
GO

CREATE NONCLUSTERED INDEX IX_Tasks_UserId_Status_Active ON Tasks(UserId, Status) INCLUDE (DueDate) WHERE IsDeleted = 0;
GO

CREATE NONCLUSTERED INDEX IX_Tasks_Priority_Status ON Tasks(Priority, Status) INCLUDE (Title, UserId, DueDate) WHERE IsDeleted = 0;
GO

CREATE OR ALTER PROCEDURE sp_GetPendingTasks
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        u.Name AS Usuario,
        SUM(CASE WHEN t.Status IN ('Pendiente', 'En progreso') THEN 1 ELSE 0 END) AS TotalPendientes,
        SUM(CASE WHEN t.Status IN ('Pendiente', 'En progreso') AND t.DueDate < CAST(GETDATE() AS DATE) THEN 1 ELSE 0 END) AS TotalVencidas
    FROM Users u
    LEFT JOIN Tasks t ON u.Id = t.UserId AND t.IsDeleted = 0
    WHERE u.IsActive = 1
    GROUP BY u.Id, u.Name
    ORDER BY TotalVencidas DESC, TotalPendientes DESC;
END;
GO

CREATE OR ALTER TRIGGER trg_AuditTaskStatus
ON Tasks
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(Status)
    BEGIN
        INSERT INTO TaskAudit (TaskId, OldStatus, NewStatus, ChangedAt)
        SELECT i.Id, d.Status, i.Status, GETDATE()
        FROM inserted i
        INNER JOIN deleted d ON i.Id = d.Id
        WHERE i.Status <> d.Status AND i.IsDeleted = 0; 
    END
END;
GO

INSERT INTO Users (Name, Email, IsActive) VALUES 
('Ana García', 'ana.garcia@example.com', 1),
('Carlos López', 'carlos.lopez@example.com', 1),
('María Rodríguez', 'maria.rodriguez@example.com', 1);
GO

INSERT INTO Tasks (Title, Description, Priority, Status, StartDate, EndDate, DueDate, UserId, CreatedAt) VALUES 
('Diseñar base de datos',   'Modelo relacional para el nuevo módulo',   'Alta',  'Terminada',  DATEADD(day,-30,GETDATE()), DATEADD(day,-15,GETDATE()), DATEADD(day,-5,  GETDATE()), 1, DATEADD(day,-35,GETDATE())),
('Implementar API REST',    'Endpoints para gestión de usuarios',        'Alta',  'En progreso',DATEADD(day,-20,GETDATE()), NULL,                       DATEADD(day,  2, GETDATE()), 2, DATEADD(day,-22,GETDATE())),
('Configurar CI/CD',        'Pipeline en GitHub Actions',                'Media', 'Pendiente',  DATEADD(day,-10,GETDATE()), NULL,                       DATEADD(day, -1, GETDATE()), 3, DATEADD(day,-12,GETDATE())),
('Actualizar dependencias', 'Migrar a Angular 20',                       'Baja',  'Pendiente',  NULL,                       NULL,                       DATEADD(day, 10, GETDATE()), 1, GETDATE()),
('Revisión de seguridad',   'Auditoría de endpoints públicos',           'Alta',  'En progreso',DATEADD(day, -5,GETDATE()), NULL,                       DATEADD(day, -2, GETDATE()), 2, DATEADD(day,-7, GETDATE()));
GO

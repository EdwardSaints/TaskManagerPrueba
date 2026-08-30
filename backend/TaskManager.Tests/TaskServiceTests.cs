using AutoMapper;
using FluentAssertions;
using Moq;
using TaskManager.Application.DTOs;
using TaskManager.Application.Mappings;
using TaskManager.Application.Services;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;
using TaskManager.Domain.Exceptions;
using TaskManager.Domain.Interfaces;
using Xunit;

namespace TaskManager.Tests;

public class TaskServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly IMapper _mapper;
    private readonly TaskService _taskService;

    public TaskServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        
        var config = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<TaskProfile>();
            cfg.AddProfile<UserProfile>();
        });
        _mapper = config.CreateMapper();

        _taskService = new TaskService(_mockUnitOfWork.Object, _mapper);
    }

    [Fact]
    public async Task CreateTask_WithValidData_ReturnsCreatedTask()
    {
        // Arrange
        var dto = new CreateTaskDto
        {
            Title = "Test Task",
            Priority = "Alta",
            Status = "Pendiente",
            UserId = 1
        };

        _mockUnitOfWork.Setup(u => u.Tasks.ExistsByTitleAndUserAsync(dto.Title, dto.UserId, null))
            .ReturnsAsync(false);

        var taskItem = new TaskItem { Id = 1, Title = "Test Task", UserId = 1, User = new User { Name = "Test User" } };
        
        _mockUnitOfWork.Setup(u => u.Tasks.AddAsync(It.IsAny<TaskItem>())).Callback<TaskItem>(t => t.Id = 1).Returns(Task.CompletedTask);
        _mockUnitOfWork.Setup(u => u.Tasks.GetByIdAsync(1)).ReturnsAsync(taskItem);

        // Act
        var result = await _taskService.CreateAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(1);
        result.Title.Should().Be("Test Task");
    }

    [Fact]
    public async Task CreateTask_WithDuplicateTitle_ThrowsDuplicateException()
    {
        // Arrange
        var dto = new CreateTaskDto { Title = "Test Task", UserId = 1 };
        
        _mockUnitOfWork.Setup(u => u.Tasks.ExistsByTitleAndUserAsync(dto.Title, dto.UserId, null))
            .ReturnsAsync(true);
        _mockUnitOfWork.Setup(u => u.Users.GetByIdAsync(1)).ReturnsAsync(new User { Name = "User1" });

        // Act
        var action = async () => await _taskService.CreateAsync(dto);

        // Assert
        await action.Should().ThrowAsync<DuplicateTaskException>();
    }

    [Fact]
    public async Task GetById_WithNonExistentId_ThrowsNotFoundException()
    {
        // Arrange
        _mockUnitOfWork.Setup(u => u.Tasks.GetByIdAsync(99)).ReturnsAsync((TaskItem?)null);

        // Act
        var action = async () => await _taskService.GetByIdAsync(99);

        // Assert
        await action.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task GetAll_WithFilters_ReturnsFilteredResults()
    {
        // Arrange
        var filter = new TaskFilterDto { Page = 1, PageSize = 10 };
        var tasks = new List<TaskItem>
        {
            new TaskItem { Id = 1, User = new User { Name = "User1" } },
            new TaskItem { Id = 2, User = new User { Name = "User2" } }
        };
        
        _mockUnitOfWork.Setup(u => u.Tasks.GetAllAsync(null, null, null, null, null, 1, 10))
            .ReturnsAsync((tasks, 2));

        // Act
        var result = await _taskService.GetAllAsync(filter);

        // Assert
        result.TotalCount.Should().Be(2);
        result.Items.Should().HaveCount(2);
    }

    [Fact]
    public async Task Delete_SoftDeletesTask()
    {
        // Arrange
        var task = new TaskItem { Id = 1 };
        _mockUnitOfWork.Setup(u => u.Tasks.GetByIdAsync(1)).ReturnsAsync(task);

        // Act
        await _taskService.DeleteAsync(1);

        // Assert
        _mockUnitOfWork.Verify(u => u.Tasks.Delete(task), Times.Once);
        _mockUnitOfWork.Verify(u => u.SaveChangesAsync(), Times.Once);
    }
}

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TaskManager.Domain.Entities;
using TaskManager.Domain.Enums;

namespace TaskManager.Infrastructure.Data.Configurations;

public class TaskItemConfiguration : IEntityTypeConfiguration<TaskItem>
{
    public void Configure(EntityTypeBuilder<TaskItem> builder)
    {
        builder.ToTable("Tasks", tb => tb.UseSqlOutputClause(false));
        
        builder.HasKey(t => t.Id);
        
        builder.Property(t => t.Title)
            .IsRequired()
            .HasMaxLength(150);

        builder.Property(t => t.Description)
            .HasMaxLength(500);

        builder.Property(t => t.Priority)
            .IsRequired()
            .HasMaxLength(20)
            .HasConversion(
                v => v.ToString(),
                v => Enum.Parse<TaskPriority>(v));

        builder.Property(t => t.Status)
            .IsRequired()
            .HasMaxLength(20)
            .HasConversion(
                v => v == TaskItemStatus.EnProgreso ? "En progreso" : v.ToString(),
                v => v == "En progreso" ? TaskItemStatus.EnProgreso : Enum.Parse<TaskItemStatus>(v));

        builder.Property(t => t.DueDate).IsRequired();
        builder.Property(t => t.CreatedAt).IsRequired().HasDefaultValueSql("GETDATE()");
        builder.Property(t => t.IsDeleted).IsRequired().HasDefaultValue(false);

        builder.HasOne(t => t.User)
            .WithMany(u => u.Tasks)
            .HasForeignKey(t => t.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        // Global query filter for soft delete
        builder.HasQueryFilter(t => !t.IsDeleted);

        // Indexes
        builder.HasIndex(t => new { t.UserId, t.Status })
            .HasFilter("IsDeleted = 0");
        
        builder.HasIndex(t => new { t.Priority, t.Status })
            .HasFilter("IsDeleted = 0");
    }
}

from django.db import models

class ProductToOrder(models.Model):
    name = models.CharField(max_length=20, null=True, blank=True)
    price = models.CharField(max_length=10, null=True, blank=True)
    icon_name = models.CharField(max_length=20, null=True, blank=True)

    TIER_CHOICES = [
        (1, 'tier1'),
        (2, 'tier2'),
        (3, 'tier3'),
        (4, 'tier4'),
        (5, 'tier5'),
        (6, 'tier6'),
        (7, 'tier7'),
        (8, 'tier8'),
        (9, 'tier9'),
    ]
    
    tier = models.IntegerField(
        choices=TIER_CHOICES,
        null=True,
        blank=True
    )

    class Meta:
        verbose_name = "Продукт для заказа"
        verbose_name_plural = "Продукты для заказа"

    def __str__(self):
        return f"Id {self.pk} - тир{self.tier} - {self.name} - {self.price}$ - {self.icon_name}"
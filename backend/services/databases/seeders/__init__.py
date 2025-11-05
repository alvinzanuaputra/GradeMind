"""
Untuk data dummy, sebagai contoh user, course, dan lain-lain secara otomatis di databasenya
"""

from .database_seeder import seed_database, reset_and_seed

__all__ = ['seed_database', 'reset_and_seed']

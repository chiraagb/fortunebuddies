from django.core.management.base import BaseCommand
from forms.models import SelectOption

class Command(BaseCommand):
    help = 'Populate SelectOption table with default values'

    def handle(self, *args, **kwargs):
        options_data = {
            'location': ["MG Road", "Brigade Road", "Indiranagar", "Koramangala", "Whitefield", "UB City", "Lalbagh",  "Cubbon Park", "Commercial Street", "Church Street"],
            'time': ["June 30 : 7.30pm", "July 1 : 6.30pm", "July 2 : 7.30pm", "July 3 : 6.30pm", "July 4 : 7.30pm", "July 5 : 6.30pm"],
            'language': ["English", "Hindi", "Marathi", "Kannada", "Tamil", "Telugu", "Malyalam"],
            'occupation': ["Undergraduate", "Postgraduate", "Working Professional", "Entrepreneur", "Self-Employed", "Taking a break"],
            'weekend': ["Outdoor activities", "Staying in", "Shopping", "Traveling", "Reading", "Cooking", "Exercising", "Visiting friends/family"],
            'hobby': ["Reading", "Music", "Cooking", "Traveling", "Sports", "Arts & Crafts", "Gardening", "Photography", "Writing", "Gaming", "Fitness",],
            'movie': ["Action", "Comedy", "Drama", "Romance", "Thriller", "Horror", "Sci-Fi", "Fantasy", "Documentary", "Animation"],
            'music': ["Bollywood", "Hollywood", "Sandalwood","Tollywood", "Devotional", "Hip Hop & Rap",],
            'cuisine': [ "South Indian","North Indian","Andhra Cuisine","Coastal Karnataka","Hyderabadi Biryani","Chinese","Italian","Middle Eastern","Continental", "Korean","Mexican", "Thai"],
            'group_activity': ["Dancing/Clubs", "Games/Sports", "Just Chatting"],
            'pet': ["Cats", "Dogs", "None"],
        }

        for option_type, values in options_data.items():
            for value in values:
                obj, created = SelectOption.objects.get_or_create(option_type=option_type, value=value)
                if created:
                    self.stdout.write(self.style.SUCCESS(f'Added {option_type}: {value}'))
                else:
                    self.stdout.write(self.style.WARNING(f'{option_type}: {value} already exists'))

        self.stdout.write(self.style.SUCCESS('Finished populating SelectOption table.'))

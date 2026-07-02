import sys
import os
import json
import urllib.request

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine, Base
from app.models import User, Restaurant
import bcrypt

def seed():
    # Automatically create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()

    # Create admin user if doesn't exist
    admin = db.query(User).filter(User.email == "admin@restaurant.com").first()
    if not admin:
        hashed = bcrypt.hashpw("Admin1234".encode(), bcrypt.gensalt()).decode()
        admin = User(
            email="admin@restaurant.com",
            username="Admin",
            password_hash=hashed,
            role="ADMIN",
            is_approved=True,
            is_active=True
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
        print("Admin user created")
    else:
        # Ensure existing admin is approved
        admin.is_approved = True
        admin.is_active = True
        db.commit()


    # Real-world famous restaurants dataset
    real_restaurants = [
        {"name": "Le Bernardin", "address": "155 W 51st St", "city": "New York", "state": "NY", "country": "USA", "phone": "212-554-1515", "cuisine": "French / Seafood", "rating": 4.9, "lead_status": "COLD", "website": "le-bernardin.com", "notes": "3 Michelin stars. Consistently ranked among the best in the world. High-profile chef Eric Ripert."},
        {"name": "The French Laundry", "address": "6640 Washington St", "city": "Yountville", "state": "CA", "country": "USA", "phone": "707-944-2380", "cuisine": "French / Californian", "rating": 4.9, "lead_status": "CONTACTED", "website": "thomaskeller.com/tfl", "notes": "Thomas Keller's iconic Napa Valley restaurant. Extremely difficult to get reservations."},
        {"name": "Alinea", "address": "1723 N Halsted St", "city": "Chicago", "state": "IL", "country": "USA", "phone": "312-867-0110", "cuisine": "Molecular Gastronomy", "rating": 4.8, "lead_status": "INTERESTED", "website": "alinearestaurant.com", "notes": "Grant Achatz's masterpiece. 3 Michelin stars. Known for highly innovative and theatrical dining."},
        {"name": "Katz's Delicatessen", "address": "205 E Houston St", "city": "New York", "state": "NY", "country": "USA", "phone": "212-254-2246", "cuisine": "Deli", "rating": 4.7, "lead_status": "CONVERTED", "website": "katzsdelicatessen.com", "notes": "Historic NYC institution since 1888. Famous for pastrami on rye."},
        {"name": "Commander's Palace", "address": "1403 Washington Ave", "city": "New Orleans", "state": "LA", "country": "USA", "phone": "504-899-8221", "cuisine": "Creole", "rating": 4.8, "lead_status": "INTERESTED", "website": "commanderspalace.com", "notes": "Legendary NOLA dining spot in the Garden District. Emeril Lagasse and Paul Prudhomme are alumni."},
        {"name": "Osteria Francescana", "address": "Via Stella, 22", "city": "Modena", "state": "MO", "country": "Italy", "phone": "+39 059 223912", "cuisine": "Italian", "rating": 5.0, "lead_status": "COLD", "website": "osteriafrancescana.it", "notes": "Massimo Bottura's 3-Michelin star restaurant. Twice ranked No. 1 in the world."},
        {"name": "Pujol", "address": "Tennyson 133, Polanco", "city": "Mexico City", "state": "CDMX", "country": "Mexico", "phone": "+52 55 5545 4111", "cuisine": "Mexican", "rating": 4.8, "lead_status": "CONTACTED", "website": "pujol.com.mx", "notes": "Enrique Olvera's flagship. Famous for the Mole Madre, aged for thousands of days."},
        {"name": "Noma", "address": "Refshalevej 96", "city": "Copenhagen", "state": "Capital Region", "country": "Denmark", "phone": "+45 32 96 32 97", "cuisine": "New Nordic", "rating": 4.9, "lead_status": "NOT_INTERESTED", "website": "noma.dk", "notes": "Rene Redzepi's legendary restaurant. Pioneer of foraging and fermentation."},
        {"name": "Gaggan Anand", "address": "68/1 Soi Langsuan", "city": "Bangkok", "state": "Bangkok", "country": "Thailand", "phone": "+66 98 883 1773", "cuisine": "Progressive Indian", "rating": 4.7, "lead_status": "COLD", "website": "gaggananand.com", "notes": "Reincarnation of the famed Gaggan. Highly experimental and emoji-based menus."},
        {"name": "Joe's Stone Crab", "address": "11 Washington Ave", "city": "Miami Beach", "state": "FL", "country": "USA", "phone": "305-673-0365", "cuisine": "Seafood", "rating": 4.6, "lead_status": "INTERESTED", "website": "joesstonecrab.com", "notes": "Opened in 1913. The most famous spot for Florida stone crabs."},
        {"name": "Franklin Barbecue", "address": "900 E 11th St", "city": "Austin", "state": "TX", "country": "USA", "phone": "512-653-1187", "cuisine": "BBQ", "rating": 4.9, "lead_status": "COLD", "website": "franklinbbq.com", "notes": "Aaron Franklin's legendary spot. People wait in line for 4+ hours every morning."},
        {"name": "Peter Luger Steak House", "address": "178 Broadway", "city": "Brooklyn", "state": "NY", "country": "USA", "phone": "718-387-7400", "cuisine": "Steakhouse", "rating": 4.4, "lead_status": "CONTACTED", "website": "peterluger.com", "notes": "Old-school, cash-only institution known for dry-aged porterhouse steaks."},
        {"name": "Chez Panisse", "address": "1517 Shattuck Ave", "city": "Berkeley", "state": "CA", "country": "USA", "phone": "510-548-5525", "cuisine": "Californian", "rating": 4.7, "lead_status": "CONVERTED", "website": "chezpanisse.com", "notes": "Alice Waters' historic restaurant that pioneered the farm-to-table movement."},
        {"name": "Husk", "address": "76 Queen St", "city": "Charleston", "state": "SC", "country": "USA", "phone": "843-577-2500", "cuisine": "Southern", "rating": 4.6, "lead_status": "INTERESTED", "website": "huskrestaurant.com", "notes": "Focused strictly on Southern ingredients. A staple of modern Charleston dining."},
        {"name": "Zuni Cafe", "address": "1658 Market St", "city": "San Francisco", "state": "CA", "country": "USA", "phone": "415-552-2522", "cuisine": "Californian / French", "rating": 4.5, "lead_status": "COLD", "website": "zunicafe.com", "notes": "Famous for their legendary roast chicken and bread salad."},
        {"name": "St. Elmo Steak House", "address": "127 S Illinois St", "city": "Indianapolis", "state": "IN", "country": "USA", "phone": "317-635-0636", "cuisine": "Steakhouse", "rating": 4.7, "lead_status": "COLD", "website": "stelmos.com", "notes": "Historic spot famous for their intensely spicy shrimp cocktail."},
        {"name": "The Bluebird Cafe", "address": "4104 Hillsboro Pike", "city": "Nashville", "state": "TN", "country": "USA", "phone": "615-383-1461", "cuisine": "American", "rating": 4.3, "lead_status": "CONTACTED", "website": "bluebirdcafe.com", "notes": "More famous for its live country music and songwriter rounds than the food."},
        {"name": "Canlis", "address": "2576 Aurora Ave N", "city": "Seattle", "state": "WA", "country": "USA", "phone": "206-283-3313", "cuisine": "Fine Dining", "rating": 4.8, "lead_status": "INTERESTED", "website": "canlis.com", "notes": "Seattle's premier fine dining establishment with incredible views and wine program."},
        {"name": "Bern's Steak House", "address": "1208 S Howard Ave", "city": "Tampa", "state": "FL", "country": "USA", "phone": "813-251-2421", "cuisine": "Steakhouse", "rating": 4.8, "lead_status": "COLD", "website": "bernssteakhouse.com", "notes": "Boasts one of the largest wine collections in the world. Features a separate dessert room."},
        {"name": "Pappy's Smokehouse", "address": "3106 Olive St", "city": "St. Louis", "state": "MO", "country": "USA", "phone": "314-535-4340", "cuisine": "BBQ", "rating": 4.7, "lead_status": "CONVERTED", "website": "pappyssmokehouse.com", "notes": "Memphis-style BBQ. Famous for their dry-rubbed ribs."},
        {"name": "Pizzeria Bianco", "address": "623 E Adams St", "city": "Phoenix", "state": "AZ", "country": "USA", "phone": "602-258-8300", "cuisine": "Pizza", "rating": 4.6, "lead_status": "COLD", "website": "pizzeriabianco.com", "notes": "Chris Bianco's legendary pizzeria, often cited as the best pizza in America."},
        {"name": "Lombardi's", "address": "32 Spring St", "city": "New York", "state": "NY", "country": "USA", "phone": "212-941-7994", "cuisine": "Pizza", "rating": 4.3, "lead_status": "CONTACTED", "website": "firstpizza.com", "notes": "America's first pizzeria, established in 1905 in Little Italy."},
        {"name": "Balthazar", "address": "80 Spring St", "city": "New York", "state": "NY", "country": "USA", "phone": "212-965-1414", "cuisine": "French Brasserie", "rating": 4.5, "lead_status": "COLD", "website": "balthazarny.com", "notes": "Iconic SoHo brasserie known for celebrity sightings and perfect steak frites."},
        {"name": "Felix Trattoria", "address": "1023 Abbot Kinney Blvd", "city": "Venice", "state": "CA", "country": "USA", "phone": "424-387-8622", "cuisine": "Italian", "rating": 4.6, "lead_status": "INTERESTED", "website": "felixla.com", "notes": "Evan Funke's pasta palace. Features a glass-enclosed pasta-making room in the center."},
        {"name": "Central", "address": "Av. Pedro de Osma 301", "city": "Lima", "state": "Lima", "country": "Peru", "phone": "+51 1 2428515", "cuisine": "Peruvian", "rating": 4.9, "lead_status": "COLD", "website": "centralrestaurante.com.pe", "notes": "Virgilio Martinez's restaurant exploring Peruvian ecosystems. Ranked No. 1 in the world in 2023."}
    ]

    # Delete existing test restaurants first so we have a clean real dataset
    db.query(Restaurant).delete()
    db.commit()

    # Seed the real ones
    for r in real_restaurants:
        restaurant = Restaurant(**r, created_by=admin.id)
        db.add(restaurant)
    
    db.commit()
    print(f"Seeded {len(real_restaurants)} REAL WORLD restaurants successfully!")
    db.close()

if __name__ == "__main__":
    seed()

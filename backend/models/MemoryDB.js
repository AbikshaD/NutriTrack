// Simple in-memory database for development
class MemoryDB {
  constructor() {
    this.users = new Map();
    this.meals = new Map();
    this.counters = { users: 1, meals: 1 };
  }

  createUser(userData) {
    const id = this.counters.users++;
    const user = { ...userData, _id: id, createdAt: new Date() };
    this.users.set(id, user);
    return Promise.resolve(user);
  }

  findUser(query) {
    const users = Array.from(this.users.values());
    return Promise.resolve(users.find(user => 
      user.email === query.email || user.username === query.username
    ));
  }

  createMeal(mealData) {
    const id = this.counters.meals++;
    const meal = { ...mealData, _id: id, createdAt: new Date() };
    if (!this.meals.has(mealData.userId)) {
      this.meals.set(mealData.userId, []);
    }
    this.meals.get(mealData.userId).push(meal);
    return Promise.resolve(meal);
  }

  findMeals(query) {
    const userMeals = this.meals.get(query.userId) || [];
    return Promise.resolve(userMeals);
  }
}

export default new MemoryDB();
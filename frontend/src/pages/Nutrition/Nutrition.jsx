
import { useCallback, useEffect, useMemo, useState } from "react";
import "./Nutrition.css";
import Sidebar from "../../components/sidebar/Sidebar.jsx";

const API_BASE = `http://${window.location.hostname}:8080/api`;

const EMPTY_NUTRIENTS = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  iron: 0,
  calcium: 0,
};

const MEALS = ["Breakfast", "Lunch", "Dinner", "Snacks"];

const round = (value) => Math.round((Number(value) || 0) * 10) / 10;

const formatNumber = (value) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 }).format(
    Number(value) || 0
  );

const getFoodName = (food) => food.foodName || food.name || "";

const getFoodNutrients = (food) => ({
  calories: Number(food.caloriesPer100g ?? food.calories ?? 0),
  protein: Number(food.proteinPer100g ?? food.protein ?? 0),
  carbs: Number(food.carbsPer100g ?? food.carbs ?? 0),
  fat: Number(food.fatPer100g ?? food.fat ?? 0),
  fiber: Number(food.fiberPer100g ?? food.fiber ?? 0),
  iron: Number(food.ironMgPer100g ?? food.iron ?? 0),
  calcium: Number(food.calciumMgPer100g ?? food.calcium ?? 0),
});

const getLogItems = (log) =>
  log.items || log.foodItems || log.nutritionLogItems || [];

const getItemNutrients = (item) => {
  const hasSavedSnapshot =
    item.calories != null ||
    item.protein != null ||
    item.carbs != null;

  if (hasSavedSnapshot) {
    return getFoodNutrients(item);
  }

  const food = item.food || item.foodItem || {};
  const nutrients = getFoodNutrients(food);
  const quantity = Number(item.quantityGrams ?? item.quantity ?? 100);

  return Object.fromEntries(
    Object.entries(nutrients).map(([key, value]) => [
      key,
      (value * quantity) / 100,
    ])
  );
};

const getLogTotals = (log) =>
  getLogItems(log).reduce(
    (totals, item) => {
      const nutrients = getItemNutrients(item);

      Object.keys(totals).forEach((key) => {
        totals[key] += nutrients[key] || 0;
      });

      return totals;
    },
    { ...EMPTY_NUTRIENTS }
  );

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;

    try {
      const error = await response.json();
      message = error.message || error.error || message;
    } catch {
      // Keep the HTTP status message if the response is not JSON.
    }

    throw new Error(message);
  }

  if (response.status === 204) return null;

  return response.json();
}

export default function Nutrition() {
  const userId = localStorage.getItem("userId");

  const [mealType, setMealType] = useState("Breakfast");
  const [foodQuery, setFoodQuery] = useState("");
  const [foodResults, setFoodResults] = useState([]);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [notes, setNotes] = useState("");
  const [todayLogs, setTodayLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadTodayLogs = useCallback(async () => {
    if (!userId) {
      setError("Your user session was not found. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      setError("");

      const result = await apiRequest(
        `/nutrition/logs/today?userId=${encodeURIComponent(userId)}`
      );

      setTodayLogs(Array.isArray(result) ? result : result?.logs || []);
    } catch (err) {
      setError(
        `Could not load your nutrition history. ${err.message}. Make sure the backend is running.`
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadTodayLogs();
  }, [loadTodayLogs]);

  const dailyTotals = useMemo(
    () =>
      todayLogs.reduce((totals, log) => {
        const mealTotals = getLogTotals(log);

        Object.keys(totals).forEach((key) => {
          totals[key] += mealTotals[key] || 0;
        });

        return totals;
      }, { ...EMPTY_NUTRIENTS }),
    [todayLogs]
  );

  const searchFoods = async (event) => {
    event.preventDefault();

    if (!foodQuery.trim()) {
      setError("Enter a food name to search.");
      return;
    }

    setSearching(true);
    setError("");
    setMessage("");

    try {
      const result = await apiRequest(
        `/nutrition/foods?query=${encodeURIComponent(foodQuery.trim())}`
      );

      setFoodResults(Array.isArray(result) ? result : result?.foods || []);

      if (!result?.length && !result?.foods?.length) {
        setMessage("No matching foods found. Try another food name.");
      }
    } catch (err) {
      setError(
        `Food search failed. ${err.message}. The food-search API must be available in the backend.`
      );
    } finally {
      setSearching(false);
    }
  };

  const addFood = (food) => {
    const id = food.id ?? food.foodId;

    if (selectedFoods.some((item) => String(item.id) === String(id))) {
      setMessage("This food is already in your meal. Update its quantity below.");
      return;
    }

    setSelectedFoods((current) => [
      ...current,
      {
        id,
        food,
        quantityGrams: 100,
      },
    ]);

    setFoodResults([]);
    setFoodQuery("");
    setMessage(`${getFoodName(food)} added to your meal.`);
  };

  const updateQuantity = (id, value) => {
    setSelectedFoods((current) =>
      current.map((item) =>
        String(item.id) === String(id)
          ? { ...item, quantityGrams: value }
          : item
      )
    );
  };

  const removeFood = (id) => {
    setSelectedFoods((current) =>
      current.filter((item) => String(item.id) !== String(id))
    );
  };

  const mealPreview = useMemo(
    () =>
      selectedFoods.reduce(
        (totals, item) => {
          const nutrients = getFoodNutrients(item.food);
          const multiplier = Number(item.quantityGrams || 0) / 100;

          Object.keys(totals).forEach((key) => {
            totals[key] += nutrients[key] * multiplier;
          });

          return totals;
        },
        { ...EMPTY_NUTRIENTS }
      ),
    [selectedFoods]
  );

  const saveMeal = async (event) => {
    event.preventDefault();

    if (!userId) {
      setError("Please log in again before saving your meal.");
      return;
    }

    if (!selectedFoods.length) {
      setError("Add at least one food item before saving.");
      return;
    }

    if (
      selectedFoods.some(
        (item) =>
          !Number.isFinite(Number(item.quantityGrams)) ||
          Number(item.quantityGrams) <= 0
      )
    ) {
      setError("Every food quantity must be greater than zero.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await apiRequest("/nutrition/logs", {
        method: "POST",
        body: JSON.stringify({
          userId: Number(userId),
          mealType,
          notes: notes.trim(),
          items: selectedFoods.map((item) => ({
            foodId: Number(item.id),
            quantityGrams: Number(item.quantityGrams),
          })),
        }),
      });

      setSelectedFoods([]);
      setNotes("");
      setFoodResults([]);
      setMessage("Your meal has been saved successfully.");

      await loadTodayLogs();
    } catch (err) {
      setError(
        `Unable to save your meal. ${err.message}. Please check the backend connection.`
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteMeal = async (log) => {
    const id = log.id ?? log.logId;

    if (id == null) {
      setError("This meal record does not have a valid ID.");
      return;
    }

    if (!window.confirm("Do you want to delete this meal record?")) return;

    try {
      setError("");
      setMessage("");

      await apiRequest(`/nutrition/logs/${id}?userId=${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });

      setMessage("Meal deleted successfully.");
      await loadTodayLogs();
    } catch (err) {
      setError(`Unable to delete this meal. ${err.message}`);
    }
  };

  const nutrients = [
    {
      key: "calories",
      label: "Calories",
      unit: "kcal",
      icon: "flame",
      className: "calories",
    },
    {
      key: "protein",
      label: "Protein",
      unit: "g",
      icon: "beef",
      className: "protein",
    },
    {
      key: "carbs",
      label: "Carbohydrates",
      unit: "g",
      icon: "wheat",
      className: "carbs",
    },
    {
      key: "fat",
      label: "Fat",
      unit: "g",
      icon: "droplets",
      className: "fat",
    },
    {
      key: "fiber",
      label: "Fiber",
      unit: "g",
      icon: "leaf",
      className: "fiber",
    },
    {
      key: "iron",
      label: "Iron",
      unit: "mg",
      icon: "heart-pulse",
      className: "iron",
    },
    {
      key: "calcium",
      label: "Calcium",
      unit: "mg",
      icon: "bone",
      className: "calcium",
    },
  ];

  return (
    <div className="nutrition-layout">
      <Sidebar />
      <main className="nutrition-page">
      <header className="nutrition-header">
        <div>
          <span className="nutrition-eyebrow">
            NURTURE AI · PREGNANCY WELLNESS
          </span>
          <h1>Nutrition Analyzer</h1>
          <p>
            Understand your meals, track essential nutrients, and build
            healthier eating habits during pregnancy.
          </p>
        </div>

        <div className="nutrition-header-icon" aria-hidden="true">
          <span>♡</span>
          <span className="nutrition-header-leaf">✦</span>
        </div>
      </header>

      {error && (
        <div className="nutrition-alert nutrition-alert-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}

      {message && (
        <div className="nutrition-alert nutrition-alert-success" role="status">
          <span>{message}</span>
          <button type="button" onClick={() => setMessage("")} aria-label="Dismiss message">
            ×
          </button>
        </div>
      )}

      <section className="nutrition-summary">
        <div className="nutrition-section-heading">
          <div>
            <h2>Today's nutrition</h2>
            <p>Your totals are calculated from your saved meals.</p>
          </div>
          <span className="nutrition-today-badge">
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="nutrition-stat-grid">
          {nutrients.map((item) => (
            <article
              className={`nutrition-stat-card nutrition-stat-${item.className}`}
              key={item.key}
            >
              <div className="nutrition-stat-top">
                <span className="nutrition-stat-icon" aria-hidden="true">
                  {item.icon === "flame" ? "♨" :
                   item.icon === "protein" ? "P" :
                   item.icon === "carbs" ? "C" :
                   item.icon === "fat" ? "◉" :
                   item.icon === "fiber" ? "❧" :
                   item.icon === "iron" ? "Fe" : "Ca"}
                </span>
                <span>{item.label}</span>
              </div>
              <strong>
                {loading ? "—" : formatNumber(dailyTotals[item.key])}
                <small> {item.unit}</small>
              </strong>
              <span className="nutrition-stat-caption">Consumed today</span>
            </article>
          ))}
        </div>
      </section>

      <div className="nutrition-main-grid">
        <section className="nutrition-panel nutrition-analyzer-panel">
          <div className="nutrition-panel-heading">
            <div>
              <span className="nutrition-panel-kicker">MEAL TRACKER</span>
              <h2>Analyze your meal</h2>
              <p>Search for a food and enter the quantity you ate.</p>
            </div>
            <span className="nutrition-panel-symbol" aria-hidden="true">＋</span>
          </div>

          <form className="nutrition-search-form" onSubmit={searchFoods}>
            <label htmlFor="nutrition-food-search">Search food</label>
            <div className="nutrition-search-row">
              <input
                id="nutrition-food-search"
                type="search"
                value={foodQuery}
                onChange={(event) => setFoodQuery(event.target.value)}
                placeholder="e.g. chapati, dal, banana"
                autoComplete="off"
              />
              <button type="submit" disabled={searching}>
                {searching ? "Searching..." : "Search"}
              </button>
            </div>
          </form>

          {foodResults.length > 0 && (
            <div className="nutrition-food-results">
              <h3>Search results</h3>
              {foodResults.map((food) => (
                <button
                  className="nutrition-food-result"
                  type="button"
                  key={food.id ?? food.foodId ?? getFoodName(food)}
                  onClick={() => addFood(food)}
                >
                  <span>
                    <strong>{getFoodName(food)}</strong>
                    <small>
                      {formatNumber(getFoodNutrients(food).calories)} kcal / 100 g
                    </small>
                  </span>
                  <span className="nutrition-add-symbol">+</span>
                </button>
              ))}
            </div>
          )}

          <form className="nutrition-meal-form" onSubmit={saveMeal}>
            <div className="nutrition-field">
              <label htmlFor="nutrition-meal-type">Meal type</label>
              <select
                id="nutrition-meal-type"
                value={mealType}
                onChange={(event) => setMealType(event.target.value)}
              >
                {MEALS.map((meal) => (
                  <option key={meal} value={meal}>{meal}</option>
                ))}
              </select>
            </div>

            <div className="nutrition-selected-heading">
              <h3>Selected food items</h3>
              <span>{selectedFoods.length} items</span>
            </div>

            {selectedFoods.length === 0 ? (
              <div className="nutrition-empty-foods">
                <span aria-hidden="true">＋</span>
                <strong>No foods added yet</strong>
                <p>Search above and select the foods in your meal.</p>
              </div>
            ) : (
              <div className="nutrition-selected-list">
                {selectedFoods.map((item) => {
                  const foodNutrients = getFoodNutrients(item.food);
                  const calories =
                    foodNutrients.calories *
                    (Number(item.quantityGrams || 0) / 100);

                  return (
                    <div className="nutrition-selected-item" key={item.id}>
                      <div className="nutrition-selected-details">
                        <strong>{getFoodName(item.food)}</strong>
                        <span>{formatNumber(calories)} kcal</span>
                      </div>
                      <label className="nutrition-quantity-field">
                        <span>Quantity (g)</span>
                        <input
                          type="number"
                          min="1"
                          max="5000"
                          step="1"
                          value={item.quantityGrams}
                          onChange={(event) =>
                            updateQuantity(item.id, event.target.value)
                          }
                          required
                        />
                      </label>
                      <button
                        className="nutrition-remove-button"
                        type="button"
                        onClick={() => removeFood(item.id)}
                        aria-label={`Remove ${getFoodName(item.food)}`}
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="nutrition-field nutrition-notes-field">
              <label htmlFor="nutrition-notes">Meal notes (optional)</label>
              <textarea
                id="nutrition-notes"
                rows="2"
                maxLength="500"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="e.g. Homemade meal, less oil..."
              />
            </div>

            <div className="nutrition-meal-preview">
              <div>
                <span>Estimated meal calories</span>
                <strong>{formatNumber(mealPreview.calories)} kcal</strong>
              </div>
              <p>
                Protein {formatNumber(mealPreview.protein)} g ·
                {" "}Carbs {formatNumber(mealPreview.carbs)} g ·
                {" "}Fat {formatNumber(mealPreview.fat)} g
              </p>
            </div>

            <button
              className="nutrition-save-button"
              type="submit"
              disabled={saving || selectedFoods.length === 0}
            >
              {saving ? "Saving meal..." : "Save meal to my nutrition log"}
            </button>
          </form>
        </section>

        <aside className="nutrition-panel nutrition-guidance-panel">
          <span className="nutrition-panel-kicker">YOUR WELLNESS</span>
          <h2>Nutrition insights</h2>
          <p className="nutrition-guidance-intro">
            Use your meal history to understand your daily eating habits.
          </p>

          <div className="nutrition-insight-item">
            <span className="nutrition-insight-number">01</span>
            <div>
              <strong>Eat a variety of foods</strong>
              <p>Include vegetables, fruits, whole grains and protein-rich foods.</p>
            </div>
          </div>

          <div className="nutrition-insight-item">
            <span className="nutrition-insight-number">02</span>
            <div>
              <strong>Track key nutrients</strong>
              <p>Review protein, iron, calcium and fiber in your saved meals.</p>
            </div>
          </div>

          <div className="nutrition-insight-item">
            <span className="nutrition-insight-number">03</span>
            <div>
              <strong>Keep a regular meal log</strong>
              <p>Recording meals helps you review patterns over time.</p>
            </div>
          </div>

          <div className="nutrition-health-note">
            <strong>Pregnancy health note</strong>
            <p>
              Nutrient needs vary by pregnancy stage and individual health.
              These estimates are for general tracking, not medical advice.
              Follow your healthcare professional's guidance.
            </p>
          </div>
        </aside>
      </div>

      <section className="nutrition-panel nutrition-history-panel">
        <div className="nutrition-section-heading">
          <div>
            <h2>Today's meal history</h2>
            <p>Meals saved to your account today.</p>
          </div>
          <button
            className="nutrition-refresh-button"
            type="button"
            onClick={loadTodayLogs}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="nutrition-history-empty">Loading your meals...</div>
        ) : todayLogs.length === 0 ? (
          <div className="nutrition-history-empty">
            <span aria-hidden="true">♡</span>
            <strong>No meals recorded today</strong>
            <p>Your saved meals will appear here.</p>
          </div>
        ) : (
          <div className="nutrition-history-list">
            {todayLogs.map((log) => {
              const items = getLogItems(log);
              const totals = getLogTotals(log);
              const logId = log.id ?? log.logId;

              return (
                <article className="nutrition-history-item" key={logId}>
                  <div className="nutrition-history-meal-icon" aria-hidden="true">
                    {log.mealType === "Breakfast" ? "☀" :
                     log.mealType === "Lunch" ? "◉" :
                     log.mealType === "Dinner" ? "☾" : "♡"}
                  </div>
                  <div className="nutrition-history-details">
                    <strong>{log.mealType || "Meal"}</strong>
                    <span>
                      {items.map((item) =>
                        getFoodName(item.food || item.foodItem || item) ||
                        item.foodName ||
                        "Food"
                      ).join(", ")}
                    </span>
                  </div>
                  <div className="nutrition-history-calories">
                    <strong>{formatNumber(totals.calories)} kcal</strong>
                    <span>
                      Protein {formatNumber(totals.protein)} g
                    </span>
                  </div>
                  <button
                    className="nutrition-remove-button"
                    type="button"
                    onClick={() => deleteMeal(log)}
                    aria-label="Delete this meal"
                  >
                    ×
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
      </main>
    </div>
  );
}

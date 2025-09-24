package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	_ "github.com/microsoft/go-mssqldb"
	"github.com/joho/godotenv"
)

type Server struct {
	db *sql.DB
}

type Atensi struct {
	ID          int       `json:"id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Priority    string    `json:"priority"`
	Status      string    `json:"status"`
	VillageID   int       `json:"villageId"`
	VillageName string    `json:"villageName"`
	CreatedAt   time.Time `json:"createdAt"`
	CreatedBy   string    `json:"createdBy"`
}

type Village struct {
	ID         int    `json:"id"`
	Name       string `json:"name"`
	Pemda      string `json:"pemda"`
	HeadName   string `json:"headName"`
	Phone      string `json:"phone"`
	Email      string `json:"email"`
	Population int    `json:"population"`
	IsActive   bool   `json:"isActive"`
}

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Database connection string
	connString := fmt.Sprintf("server=%s;user id=%s;password=%s;database=%s;port=%s",
		getEnv("DB_HOST", "localhost"),
		getEnv("DB_USER", "sa"),
		getEnv("DB_PASSWORD", ""),
		getEnv("DB_NAME", "CACMDesa"),
		getEnv("DB_PORT", "1433"),
	)

	// Open database connection
	db, err := sql.Open("sqlserver", connString)
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}
	defer db.Close()

	// Test connection
	if err := db.Ping(); err != nil {
		log.Fatal("Error pinging database:", err)
	}

	log.Println("Connected to SQL Server database")

	server := &Server{db: db}

	// Setup routes
	router := mux.NewRouter()
	api := router.PathPrefix("/api").Subrouter()

	// Atensi routes
	api.HandleFunc("/atensi", server.GetAtensiList).Methods("GET")
	api.HandleFunc("/atensi/{id}", server.GetAtensi).Methods("GET")
	api.HandleFunc("/atensi", server.CreateAtensi).Methods("POST")
	api.HandleFunc("/atensi/{id}", server.UpdateAtensi).Methods("PUT")
	api.HandleFunc("/atensi/{id}", server.DeleteAtensi).Methods("DELETE")

	// Village routes
	api.HandleFunc("/villages", server.GetVillages).Methods("GET")
	api.HandleFunc("/villages/{id}", server.GetVillage).Methods("GET")

	// Dashboard stats
	api.HandleFunc("/dashboard/stats", server.GetDashboardStats).Methods("GET")

	// Setup CORS
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:3001"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	handler := c.Handler(router)

	port := getEnv("PORT", "8080")
	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// GetAtensiList returns list of atensi with pagination
func (s *Server) GetAtensiList(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT 
			a.ID, a.Title, a.Description, a.Priority, a.Status,
			a.VillageID, v.Name as VillageName, a.CreatedAt, a.CreatedBy
		FROM Atensi a
		LEFT JOIN Villages v ON a.VillageID = v.ID
		ORDER BY a.CreatedAt DESC
		OFFSET 0 ROWS FETCH NEXT 20 ROWS ONLY
	`

	rows, err := s.db.Query(query)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var atensiList []Atensi
	for rows.Next() {
		var a Atensi
		err := rows.Scan(&a.ID, &a.Title, &a.Description, &a.Priority, &a.Status,
			&a.VillageID, &a.VillageName, &a.CreatedAt, &a.CreatedBy)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		atensiList = append(atensiList, a)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(atensiList)
}

// GetAtensi returns single atensi by ID
func (s *Server) GetAtensi(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var a Atensi
	query := `
		SELECT 
			a.ID, a.Title, a.Description, a.Priority, a.Status,
			a.VillageID, v.Name as VillageName, a.CreatedAt, a.CreatedBy
		FROM Atensi a
		LEFT JOIN Villages v ON a.VillageID = v.ID
		WHERE a.ID = @p1
	`
	err := s.db.QueryRow(query, id).Scan(&a.ID, &a.Title, &a.Description, &a.Priority, 
		&a.Status, &a.VillageID, &a.VillageName, &a.CreatedAt, &a.CreatedBy)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Atensi not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(a)
}

// CreateAtensi creates new atensi
func (s *Server) CreateAtensi(w http.ResponseWriter, r *http.Request) {
	var a Atensi
	if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	query := `
		INSERT INTO Atensi (Title, Description, Priority, Status, VillageID, CreatedAt, CreatedBy)
		VALUES (@p1, @p2, @p3, @p4, @p5, @p6, @p7);
		SELECT SCOPE_IDENTITY();
	`

	var id int64
	err := s.db.QueryRow(query, a.Title, a.Description, a.Priority, "OPEN", 
		a.VillageID, time.Now(), a.CreatedBy).Scan(&id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	a.ID = int(id)
	a.CreatedAt = time.Now()
	a.Status = "OPEN"

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(a)
}

// UpdateAtensi updates existing atensi
func (s *Server) UpdateAtensi(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var a Atensi
	if err := json.NewDecoder(r.Body).Decode(&a); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	query := `
		UPDATE Atensi 
		SET Title = @p1, Description = @p2, Priority = @p3, Status = @p4, VillageID = @p5
		WHERE ID = @p6
	`

	_, err := s.db.Exec(query, a.Title, a.Description, a.Priority, a.Status, a.VillageID, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// DeleteAtensi deletes atensi
func (s *Server) DeleteAtensi(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	query := "DELETE FROM Atensi WHERE ID = @p1"
	_, err := s.db.Exec(query, id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetVillages returns list of villages
func (s *Server) GetVillages(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT ID, Name, Pemda, HeadName, Phone, Email, Population, IsActive
		FROM Villages
		WHERE IsActive = 1
		ORDER BY Name
	`

	rows, err := s.db.Query(query)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var villages []Village
	for rows.Next() {
		var v Village
		err := rows.Scan(&v.ID, &v.Name, &v.Pemda, &v.HeadName, 
			&v.Phone, &v.Email, &v.Population, &v.IsActive)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		villages = append(villages, v)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(villages)
}

// GetVillage returns single village by ID
func (s *Server) GetVillage(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	var v Village
	query := `
		SELECT ID, Name, Pemda, HeadName, Phone, Email, Population, IsActive
		FROM Villages
		WHERE ID = @p1
	`
	err := s.db.QueryRow(query, id).Scan(&v.ID, &v.Name, &v.Pemda, &v.HeadName,
		&v.Phone, &v.Email, &v.Population, &v.IsActive)
	if err != nil {
		if err == sql.ErrNoRows {
			http.Error(w, "Village not found", http.StatusNotFound)
		} else {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(v)
}

// GetDashboardStats returns dashboard statistics
func (s *Server) GetDashboardStats(w http.ResponseWriter, r *http.Request) {
	stats := make(map[string]interface{})

	// Get total atensi
	var totalAtensi int
	s.db.QueryRow("SELECT COUNT(*) FROM Atensi").Scan(&totalAtensi)
	stats["totalAtensi"] = totalAtensi

	// Get open atensi
	var openAtensi int
	s.db.QueryRow("SELECT COUNT(*) FROM Atensi WHERE Status = 'OPEN'").Scan(&openAtensi)
	stats["openAtensi"] = openAtensi

	// Get closed atensi
	var closedAtensi int
	s.db.QueryRow("SELECT COUNT(*) FROM Atensi WHERE Status = 'CLOSED'").Scan(&closedAtensi)
	stats["closedAtensi"] = closedAtensi

	// Get total villages
	var totalVillages int
	s.db.QueryRow("SELECT COUNT(*) FROM Villages WHERE IsActive = 1").Scan(&totalVillages)
	stats["totalVillages"] = totalVillages

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}
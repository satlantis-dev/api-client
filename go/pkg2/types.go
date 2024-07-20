package pkg2

import (
	"github.com/lib/pq"
	"time"
)

type Place struct {
	ID             uint                 `gorm:"primaryKey" json:"id"`
	CreatedAt      time.Time            `json:"-"`
	UpdatedAt      time.Time            `json:"-"`
	DeletedAt      *time.Time           `gorm:"index" json:"-,omitempty"`
	AccountRoles   []AccountPlaceRole   `gorm:"foreignKey:PlaceID" json:"account_roles"`
	Active         bool                 `json:"active"`
	Banner         string               `gorm:"type:text" json:"banner"`
	CategoryScores []PlaceCategoryScore `gorm:"foreignKey:PlaceID" json:"category_scores"`
	CountryID      uint                 `gorm:"index" json:"country_id"`
	Country        Country              `json:"country"`
	Descendants    []PlaceWithClosure   `gorm:"-" json:"descendants"`
	Description    string               `gorm:"type:text" json:"description"`
	EventID        *uint                `gorm:"index" json:"event_id"`
	Event          Event                `json:"event"`
	Lat            float64              `json:"lat"`
	Level          PlaceLevel           `gorm:"type:text" json:"level"`
	Lng            float64              `json:"lng"`
	Metrics        []PlaceMetric        `gorm:"foreignKey:PlaceID" json:"metrics"`
	Name           string               `gorm:"index;type:text" json:"name"`
	Notes          []PlaceNote          `gorm:"foreignKey:PlaceID" json:"notes"`
	OSMID          *uint                `json:"osm_id"`
	OSMLevel       string               `json:"osm_level"`
	OSMType        OSMType              `json:"osm_type"`
	OSMRef         string     a          `gorm:"uniqueIndex" json:"osm_ref"`
	RegionID       *uint                `gorm:"index" json:"region_id"`
	Region         Region               `gorm:"foreignKey:RegionID" json:"region"`
	Slug           string               `gorm:"type:text" json:"slug"` // Unique slug for the place navigation
	WeatherID      *uint                `gorm:"index" json:"weather_id"`
	Weather        Weather              `gorm:"foreignKey:PlaceID" json:"weather"`
	Hashtags       pq.StringArray       `gorm:"type:varchar[]" json:"hashtags"`
}

type AccountPlaceRole struct {
	AccountID         uint                 `gorm:"index;primaryKey" json:"account_id"`
	Account           AccountDTO           `gorm:"foreignKey:AccountID" json:"account"`
	PlaceID           uint                 `gorm:"index;primaryKey" json:"place_id"`
	Place             Place                `gorm:"foreignKey:PlaceID" json:"place"`
	AmbassadorRequest bool                 `json:"ambassador_request"`
	Type              AccountPlaceRoleType `gorm:"not null" json:"type"`
}

type PlaceCategoryScore struct {
	CategoryID  uint              `gorm:"primaryKey;autoIncrement:false" json:"category_id"`
	Category    Category          `json:"category"`
	PlaceID     uint              `gorm:"primaryKey;autoIncrement:false" json:"-"`
	Score       float64           `json:"score"`
	TopicScores []PlaceTopicScore `gorm:"foreignKey:CategoryID,PlaceID;references:CategoryID,PlaceID" json:"topic_scores"`
	UpdatedAt   time.Time         `json:"-"`
}

type Country struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	CreatedAt   time.Time  `json:"-"`
	UpdatedAt   time.Time  `json:"-"`
	DeletedAt   *time.Time `gorm:"index" json:"-,omitempty"`
	Code        string     `gorm:"type:char(2);uniqueIndex" json:"code"`
	Code_3      string     `gorm:"type:char(3);uniqueIndex" json:"code_3"`
	Name        string     `gorm:"type:text" json:"name"`
	ContinentID uint       `json:"-"`
	Continent   Continent  `json:"-"`
}

type Continent struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time  `json:"-"`
	UpdatedAt time.Time  `json:"-"`
	DeletedAt *time.Time `gorm:"index" json:"-,omitempty"`
	Code      string     `gorm:"type:char(2);uniqueIndex" json:"code"`
	Name      string     `gorm:"type:text" json:"name"`
}

type PlaceWithClosure struct {
	Place
	AncestorID   uint `gorm:"index" json:"ancestor_id"`
	DescendantID uint `gorm:"index" json:"descendant_id"`
	Depth        uint `json:"depth"`
}

type Event struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	NostrID    string `gorm:"index" json:"nostr_id"`
	CreatedAt  int64  `json:"created_at"`
	Content    string `gorm:"type:text" json:"content"`
	Kind       uint   `gorm:"index" json:"kind"`
	PubKey     string `gorm:"type:text" json:"pubkey"`
	Sig        string `gorm:"type:text" json:"sig"`
	Tags       []Tag  `gorm:"foreignKey:EventID" json:"tags"`
	Reconciled bool   `gorm:"default:false" json:"reconciled"`
}

type Tag struct {
	ID      uint           `gorm:"primaryKey" json:"-"`
	EventID uint           `gorm:"index" json:"event_id"`
	Type    string         `json:"type"`
	Values  pq.StringArray `gorm:"type:text[]" json:"values"`
}

type PlaceLevel string

type PlaceMetric struct {
	DataPoints uint      `json:"-"`
	PlaceID    uint      `gorm:"primaryKey" json:"-"`
	MetricID   uint      `gorm:"primaryKey" json:"-"`
	Metric     MetricDTO `json:"metric"`
	UpdatedAt  time.Time `json:"-"`
	Value      float64   `json:"value"`
	ValueStr   string    `json:"value_str"`
	Score      float64   `json:"score"`
}

type PlaceNote struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time  `json:"-"`
	UpdatedAt time.Time  `json:"-"`
	DeletedAt *time.Time `gorm:"index" json:"-,omitempty"`
	PlaceID   uint       `gorm:"index" json:"place_id"`
	Place     Place      `json:"place"`
	NoteID    uint       `gorm:"index" json:"note_id"`
	Note      Note       `json:"note"`
	Type      NoteType   `json:"type"`
}

type NoteType int

const (
	BasicNote NoteType = iota + 1
	ReviewNote
	PhotoNote
	PublicChatNote
	PrivateChatNote
	CalendarEventNote
	CalendarNote
	Ping
	ReactionNote
	DeleteNote
	ReplyNote
)

type Note struct {
	ID                 uint                `gorm:"primaryKey" json:"id"`
	AccountID          uint                `gorm:"index" json:"account_id"`
	Account            Account             `json:"account"`
	CalendarEventRSVPs []CalendarEventRSVP `gorm:"foreignKey:NoteID" json:"calendar_event_rsvps"`
	ChatMemberships    []ChatMembership    `gorm:"foreignKey:NoteID" json:"chat_memberships"`
	Descendants        []NoteWithClosure   `gorm:"-" json:"descendants"`
	EventID            uint                `gorm:"index" json:"event_id"`
	Event              Event               `json:"event"`
	Type               NoteType            `json:"type"`
	RepostedNoteID     *uint               `gorm:"index" json:"reposted_note_id"`
	RepostedNote       *Note               `json:"reposted_note"`
	Reactions          []Reaction          `gorm:"foreignKey:NoteID" json:"reactions"`
}

type NoteWithClosure struct {
	Note
	AncestorID   uint `gorm:"column:ancestor_id" json:"ancestor_id"`
	Depth        int  `gorm:"column:depth" json:"depth"`
	DescendantID uint `gorm:"column:descendant_id" json:"descendant_id"`
}

type CalendarEventRSVP struct {
	ID        uint    `gorm:"primaryKey" json:"id"`
	AccountID uint    `gorm:"index;not null" json:"account_id"`
	Account   Account `json:"account"`
	EventID   uint    `gorm:"index;not null" json:"event_id"`
	NoteID    uint    `gorm:"index;not null" json:"note_id"`
	Status    string  `json:"status"`
}

type Reaction struct {
	ID        uint  `gorm:"primaryKey" json:"id"`
	AccountID uint  `gorm:"index;not null" json:"account_id"`
	EventID   uint  `gorm:"index;not null" json:"event_id"`
	Event     Event `json:"event"`
	NoteID    uint  `gorm:"index;not null" json:"note_id"`
}

type AccountType int

const (
	BasicType AccountType = iota + 1
	AmbassadorType
	FounderType
	AdminType
)

type Account struct {
	ID                          uint                    `gorm:"primaryKey" json:"id"`
	CreatedAt                   time.Time               `json:"-"`
	About                       string                  `gorm:"type:text" json:"about"`
	AccountPlaceRoles           []AccountPlaceRole      `gorm:"foreignKey:AccountID" json:"account_place_roles"`
	AccountType                 AccountType             `gorm:"type:smallint" json:"account_type"`
	AuthDetails                 []AuthenticationDetail  `gorm:"foreignKey:AccountID" json:"auth_details"`
	Banner                      string                  `gorm:"type:text" json:"banner"`
	ChatMemberships             []ChatMembership        `gorm:"foreignKey:AccountID" json:"chat_memberships"`
	CurrencyID                  *uint                   `gorm:"index" json:"currency_id"`
	Currency                    Currency                `json:"currency"`
	DisplayName                 string                  `gorm:"type:text" json:"display_name"`
	Email                       string                  `gorm:"default:NULL" json:"email"`
	EmailVerified               bool                    `json:"email_verified"`
	Experiences                 []Experience            `gorm:"foreignKey:AccountID" json:"experiences"`
	Following                   []Follow                `gorm:"foreignkey:FollowerID" json:"following"`
	FollowedBy                  []Follow                `gorm:"foreignkey:FollowerID" json:"followed_by"`
	InfluenceScore              uint                    `json:"influence_score"`
	Interests                   *string                 `gorm:"type:jsonb" json:"interests"`
	IsBusiness                  bool                    `json:"is_business"`
	LastSeen                    *time.Time              `json:"-"`
	LocationRatings             []AccountLocationRating `gorm:"foreignKey:AccountID" json:"location_ratings"`
	Lud06                       string                  `gorm:"default:NULL" json:"lud06"`
	Lud16                       string                  `gorm:"default:NULL" json:"lud16"`
	Name                        string                  `gorm:"type:text" json:"name"`
	Nip05                       string                  `gorm:"default:NULL" json:"nip05"`
	Notes                       []Note                  `gorm:"foreignKey:AccountID" json:"notes"`
	Npub                        string                  `gorm:"uniqueIndex" json:"npub"`
	Picture                     string                  `gorm:"type:text" json:"picture"`
	Phone                       string                  `json:"phone"`
	PlaceRatings                []AccountPlaceRating    `gorm:"foreignKey:AccountID" json:"place_ratings"`
	PubKey                      string                  `gorm:"uniqueIndex;default:NULL" json:"pub_key"`
	SocialMediaList             []SocialMedia           `gorm:"foreignKey:AccountID" json:"social_media_list"`
	Website                     string                  `gorm:"type:text" json:"website"`
	ResetPasswordToken          *string                 `gorm:"type:text" json:"reset_password_token"`
	ResetPasswordTokenExpiresAt *time.Time              `json:"-"`
	Locations                   []LocationAccount       `gorm:"foreignKey:AccountID" json:"locations"`
}

type OSMType string

const (
	OSMTypeNode     OSMType = "node"
	OSMTypeRelation OSMType = "relation"
	OSMTypeWay      OSMType = "way"
)

type Region struct {
	ID             uint                  `gorm:"primaryKey" json:"id"`
	Code           string                `gorm:"type:text" json:"code"`
	CreatedAt      time.Time             `json:"-"`
	UpdatedAt      time.Time             `json:"-"`
	DeletedAt      *time.Time            `gorm:"index" json:"-,omitempty"`
	Banner         string                `gorm:"type:text" json:"banner"`
	CategoryScores []RegionCategoryScore `gorm:"foreignKey:RegionID" json:"category_scores"`
	CountryID      uint                  `gorm:"index" json:"country_id"`
	Country        Country               `json:"country"`
	Description    string                `gorm:"type:text" json:"description"`
	EventID        *uint                 `gorm:"index" json:"event_id"`
	Event          Event                 `json:"event"`
	Lat            float64               `json:"lat"`
	Lng            float64               `json:"lng"`
	Metrics        []RegionMetric        `gorm:"foreignKey:RegionID" json:"metrics"`
	Name           string                `gorm:"index;type:text" json:"name"`
	OSMID          *uint                 `json:"osm_id"`
	OSMLevel       string                `json:"osm_level"`
	OSMType        OSMType               `json:"osm_type"`
	OSMRef         string                `gorm:"uniqueIndex" json:"osm_ref"`
	Places         []Place               `gorm:"foreignKey:RegionID" json:"places"`
	Slug           string                `gorm:"type:text" json:"slug"` // Unique slug for the region navigation
	Hashtags       pq.StringArray        `gorm:"type:varchar[]" json:"hashtags"`
}

type Weather struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	CreatedAt time.Time  `json:"-"`
	UpdatedAt time.Time  `json:"-"`
	DeletedAt *time.Time `gorm:"index" json:"-,omitempty"`
	PlaceID   uint       `gorm:"index" json:"place_id"`
	Humidity  int        `json:"humidity"`
	Pressure  int        `json:"pressure"`
	Temp      float64    `json:"temp"`
}

type AccountDTO struct {
	ID          uint        `json:"id"`
	About       string      `json:"about"`
	AccountType AccountType `json:"account_type"`
	IsBusiness  bool        `json:"is_business"`
	Name        string      `json:"name"`
	Nip05       string      `gorm:"default:NULL" json:"nip05"`
	Npub        string      `json:"npub"`
	Picture     string      `json:"picture"`
	PubKey      string      `json:"pub_key"`
}

type AccountPlaceRoleType int

const (
	Follower AccountPlaceRoleType = iota + 1
	Visitor
	Inhabitant
	Ambassador
)

type RegionCategoryScore struct {
	CategoryID  uint               `gorm:"primaryKey;autoIncrement:false" json:"category_id"`
	Category    Category           `json:"category"`
	RegionID    uint               `gorm:"primaryKey;autoIncrement:false" json:"-"`
	Score       float64            `json:"score"`
	TopicScores []RegionTopicScore `gorm:"foreignKey:CategoryID,RegionID;references:CategoryID,RegionID" json:"topic_scores"`
	UpdatedAt   time.Time          `json:"-"`
}

type Category struct {
	ID          uint   `gorm:"primaryKey" json:"id"`
	Description string `gorm:"type:text" json:"description"`
	Name        string `gorm:"type:text" json:"name"`
}

type RegionTopicScore struct {
	CategoryID uint      `gorm:"primaryKey;index;autoIncrement:false" json:"category_id"`
	RegionID   uint      `gorm:"primaryKey;autoIncrement:false" json:"region_id"`
	Score      float64   `json:"score"`
	UpdatedAt  time.Time `json:"updated_at"`
	TopicID    uint      `gorm:"primaryKey;autoIncrement:false" json:"topic_id"`
	Topic      Topic     `json:"topic"`
	UserNumber uint      `json:"user_number"`
	UserScore  float64   `json:"user_score"`
}

type Topic struct {
	ID          uint     `gorm:"primaryKey" json:"id"`
	CategoryID  uint     `gorm:"index" json:"-"`
	Category    Category `json:"-"`
	Description string   `gorm:"type:text" json:"description"`
	InFocus     bool     `json:"in_focus"`
	Name        string   `gorm:"type:text" json:"name"`
	Weight      uint     `json:"weight"`
}

type RegionMetric struct {
	DataPoints uint      `json:"-"`
	RegionID   uint      `gorm:"primaryKey" json:"-"`
	MetricID   uint      `gorm:"primaryKey" json:"-"`
	Metric     MetricDTO `json:"metric"`
	UpdatedAt  time.Time `json:"-"`
	Value      float64   `json:"value"`
	ValueStr   string    `json:"value_str"`
	Score      float64   `json:"score"`
}

type MetricDTO struct {
	ID          uint     `json:"id"`
	CategoryID  uint     `json:"category_id"`
	Category    Category `json:"category"`
	Description string   `json:"description"`
	Name        string   `json:"name"`
	Prompt      string   `json:"prompt"`
	Slug        string   `json:"slug"`
	Suffix      string   `json:"suffix"`
	Tags        string   `json:"tags"`
	TopicID     uint     `json:"topic_id"`
	Topic       Topic    `json:"topic"`
}

type PlaceTopicScore struct {
	CategoryID uint      `gorm:"primaryKey;index;autoIncrement:false" json:"category_id"`
	PlaceID    uint      `gorm:"primaryKey;autoIncrement:false" json:"place_id"`
	Score      float64   `json:"score"`
	UpdatedAt  time.Time `json:"updated_at"`
	TopicID    uint      `gorm:"primaryKey;autoIncrement:false" json:"topic_id"`
	Topic      Topic     `json:"topic"`
	UserNumber uint      `json:"user_number"`
	UserScore  float64   `json:"user_score"`
}

type ChatMembership struct {
	ID             uint       `gorm:"primaryKey" json:"id"`
	CreatedAt      time.Time  `json:"-"`
	UpdatedAt      time.Time  `json:"-"`
	DeletedAt      *time.Time `gorm:"index" json:"-,omitempty"`
	AccountID      uint       `gorm:"index" json:"account_id"`
	Account        Account    `json:"account"`
	LastReadNoteID *uint      `json:"last_read_note_id"`
	NoteID         uint       `gorm:"index" json:"note_id"`
	Note           Note       `json:"note"`
}

type AuthenticationDetail struct {
	ID          uint                   `gorm:"primaryKey" json:"id"`
	CreatedAt   time.Time              `json:"-"`
	UpdatedAt   time.Time              `json:"-"`
	DeletedAt   *time.Time             `gorm:"index" json:"-,omitempty"`
	AccountID   uint                   `gorm:"index" json:"account_id"`
	Provider    AuthenticationProvider `gorm:"type:smallint" json:"provider"` // Email, Google, Twitter, Facebook, Nostr
	ProviderUID string                 `gorm:"uniqueIndex" json:"-"`          // UID returned by the provider. For EmailProvider, it can be the same as the Account's email.
	Password    string                 `json:"password"`                      // Store encrypted password for EmailProvider. Not needed for social logins.
}

type AuthenticationProvider int

const (
	EmailProvider AuthenticationProvider = iota + 1
	GoogleProvider
	TwitterProvider
	FacebookProvider
	NostrProvider
)

type Currency struct {
	ID           uint    `gorm:"primaryKey" json:"id"`
	Code         string  `gorm:"uniqueIndex" json:"code"`
	Name         string  `json:"name"`
	Symbol       string  `json:"symbol"`
	ExchangeRate float64 `json:"exchange_rate"`
}

type Experience struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	CreatedAt   time.Time  `json:"-"`
	UpdatedAt   time.Time  `json:"-"`
	DeletedAt   *time.Time `gorm:"index" json:"-,omitempty"`
	AccountID   uint       `gorm:"index" json:"account_id"`
	CityID      uint       `gorm:"index" json:"city_id"`
	Cost        float32    `json:"cost"`
	Currency    string     `gorm:"type:text" json:"currency"`
	Description string     `gorm:"type:text" json:"description"`
	Name        string     `gorm:"type:text" json:"name"`
	Type        string     `gorm:"type:text" json:"type"`
	URL         string     `gorm:"type:text" json:"url"`
}

type Follow struct {
	FollowerID  uint `gorm:"index:idx_follower_following,unique"`
	FollowingID uint `gorm:"index:idx_follower_following,unique"`
}

type AccountLocationRating struct {
	AccountID  uint   `gorm:"primaryKey" json:"account_id"`
	LocationID uint   `gorm:"primaryKey" json:"location_id"`
	Review     string `json:"review"`
	Ratings    string `gorm:"type:jsonb" json:"ratings"`
}

type AccountPlaceRating struct {
	AccountID uint   `gorm:"primaryKey" json:"account_id"`
	PlaceID   uint   `gorm:"primaryKey" json:"place_id"`
	Review    string `json:"review"`
	Ratings   string `gorm:"type:jsonb" json:"ratings"`
}

type SocialMedia struct {
	ID              uint            `gorm:"primaryKey" json:"id"`
	CreatedAt       time.Time       `json:"-"`
	UpdatedAt       time.Time       `json:"-"`
	DeletedAt       *time.Time      `gorm:"index" json:"-"`
	Name            string          `gorm:"type:text" json:"name"`
	Link            string          `gorm:"type:text" json:"link"`
	AccountID       uint            `gorm:"index" json:"account_id"`
	BusinessID      uint            `gorm:"index" json:"business_id"`
	SocialMediaType SocialMediaType `json:"social_media_type"`
}

type SocialMediaType int

const (
	Facebook AccountType = iota + 1
	Instagram
	LinkedIn
	Twitter
)

type LocationAccount struct {
	LocationID      uint                `gorm:"primaryKey" json:"location_id"`
	AccountID       uint                `gorm:"primaryKey" json:"account_id"`
	Type            LocationAccountType `gorm:"not null" json:"type"`
	ClaimCode       string              `gorm:"type:text" json:"claim_code"`
	ClaimVerifiedAt *time.Time          `json:"-"`
}

type LocationAccountType string

const (
	LocationAccountTypeOwner   LocationAccountType = "owner"
	LocationAccountTypeManager LocationAccountType = "manager"
	LocationAccountTypeMember  LocationAccountType = "member"
	LocationAccountTypeVisitor LocationAccountType = "visitor"
)

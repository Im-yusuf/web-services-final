-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_sales" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "transfer_date" TIMESTAMP(3) NOT NULL,
    "postcode" TEXT NOT NULL,
    "property_type" TEXT NOT NULL,
    "new_build" BOOLEAN NOT NULL DEFAULT false,
    "tenure" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "town_city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "property_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_listings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_reports" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "avg_price" DOUBLE PRECISION NOT NULL,
    "price_growth" DOUBLE PRECISION NOT NULL,
    "total_sales" INTEGER NOT NULL DEFAULT 0,
    "report_date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "favorite_regions" TEXT[],
    "budget_min" INTEGER,
    "budget_max" INTEGER,
    "property_types" TEXT[],

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "property_sales_transaction_id_key" ON "property_sales"("transaction_id");

-- CreateIndex
CREATE INDEX "property_sales_postcode_idx" ON "property_sales"("postcode");

-- CreateIndex
CREATE INDEX "property_sales_town_city_idx" ON "property_sales"("town_city");

-- CreateIndex
CREATE INDEX "property_sales_district_idx" ON "property_sales"("district");

-- CreateIndex
CREATE INDEX "property_sales_county_idx" ON "property_sales"("county");

-- CreateIndex
CREATE INDEX "property_sales_transfer_date_idx" ON "property_sales"("transfer_date");

-- CreateIndex
CREATE INDEX "property_sales_property_type_idx" ON "property_sales"("property_type");

-- CreateIndex
CREATE INDEX "property_sales_price_idx" ON "property_sales"("price");

-- CreateIndex
CREATE UNIQUE INDEX "saved_listings_user_id_property_id_key" ON "saved_listings"("user_id", "property_id");

-- CreateIndex
CREATE INDEX "market_reports_region_idx" ON "market_reports"("region");

-- CreateIndex
CREATE INDEX "market_reports_report_date_idx" ON "market_reports"("report_date");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_listings" ADD CONSTRAINT "saved_listings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_listings" ADD CONSTRAINT "saved_listings_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "property_sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

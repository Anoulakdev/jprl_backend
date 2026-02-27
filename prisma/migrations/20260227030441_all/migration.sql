-- CreateTable
CREATE TABLE "FcmToken" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "platform" VARCHAR(255) NOT NULL,
    "model" VARCHAR(255) NOT NULL,
    "fcmtoken" VARCHAR(255) NOT NULL,

    CONSTRAINT "FcmToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shop" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "tel" VARCHAR(255),
    "userCode" VARCHAR(255) NOT NULL,
    "approved" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "Shop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "catimg" VARCHAR(255),
    "code" VARCHAR(255),

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER,
    "categoryId" INTEGER,
    "productunitId" INTEGER NOT NULL,
    "actived" VARCHAR(50) NOT NULL DEFAULT 'A',
    "approved" INTEGER NOT NULL DEFAULT 1,
    "title" VARCHAR(255),
    "detail" TEXT,
    "price" DECIMAL(10,2),
    "pimg" VARCHAR(255),
    "percent" SMALLINT,
    "userActionId" INTEGER,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProduct" (
    "userCode" VARCHAR(255) NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "UserProduct_pkey" PRIMARY KEY ("userCode","productId")
);

-- CreateTable
CREATE TABLE "ProductUnit" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(255),

    CONSTRAINT "ProductUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductStatus" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(255),

    CONSTRAINT "ProductStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "orderNo" VARCHAR(255) NOT NULL,
    "shopId" INTEGER,
    "userCode" VARCHAR(255) NOT NULL,
    "grandtotalprice" DECIMAL(10,2),
    "currentStatusId" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderDetail" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER,
    "quantity" INTEGER DEFAULT 1,
    "price" DECIMAL(10,2),
    "totalprice" DECIMAL(10,2),
    "percent" SMALLINT,

    CONSTRAINT "OrderDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderStatus" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productstatusId" INTEGER NOT NULL,
    "comment" TEXT,
    "payimg" VARCHAR(255),
    "sendlocationId" INTEGER,
    "userCode" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SendLocation" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "SendLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankLogo" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "bankimg" VARCHAR(255) NOT NULL,

    CONSTRAINT "BankLogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bank" (
    "id" SERIAL NOT NULL,
    "shopId" INTEGER,
    "banklogoId" INTEGER,
    "accountNo" VARCHAR(255),
    "accountName" VARCHAR(255),
    "bankqr" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "userCode" VARCHAR(255) NOT NULL,
    "rating" SMALLINT,
    "comment" TEXT,
    "createdAt" TIMESTAMPTZ(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(0) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FcmToken_userId_platform_model_key" ON "FcmToken"("userId", "platform", "model");

-- CreateIndex
CREATE UNIQUE INDEX "Shop_userCode_key" ON "Shop"("userCode");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNo_key" ON "Order"("orderNo");

-- CreateIndex
CREATE INDEX "Order_orderNo_idx" ON "Order"("orderNo");

-- CreateIndex
CREATE INDEX "OrderDetail_orderId_idx" ON "OrderDetail"("orderId");

-- CreateIndex
CREATE INDEX "Review_productId_idx" ON "Review"("productId");

-- AddForeignKey
ALTER TABLE "FcmToken" ADD CONSTRAINT "FcmToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shop" ADD CONSTRAINT "Shop_userCode_fkey" FOREIGN KEY ("userCode") REFERENCES "User"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_productunitId_fkey" FOREIGN KEY ("productunitId") REFERENCES "ProductUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_userActionId_fkey" FOREIGN KEY ("userActionId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProduct" ADD CONSTRAINT "UserProduct_userCode_fkey" FOREIGN KEY ("userCode") REFERENCES "User"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProduct" ADD CONSTRAINT "UserProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userCode_fkey" FOREIGN KEY ("userCode") REFERENCES "User"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_currentStatusId_fkey" FOREIGN KEY ("currentStatusId") REFERENCES "ProductStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderDetail" ADD CONSTRAINT "OrderDetail_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatus" ADD CONSTRAINT "OrderStatus_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatus" ADD CONSTRAINT "OrderStatus_productstatusId_fkey" FOREIGN KEY ("productstatusId") REFERENCES "ProductStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatus" ADD CONSTRAINT "OrderStatus_sendlocationId_fkey" FOREIGN KEY ("sendlocationId") REFERENCES "SendLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatus" ADD CONSTRAINT "OrderStatus_userCode_fkey" FOREIGN KEY ("userCode") REFERENCES "User"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bank" ADD CONSTRAINT "Bank_banklogoId_fkey" FOREIGN KEY ("banklogoId") REFERENCES "BankLogo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userCode_fkey" FOREIGN KEY ("userCode") REFERENCES "User"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

const express=require ('express')
const userAuth=require('../middleware/userAuth.js')

const Stripe=require('stripe')
const stripe=new Stripe(process.env.STRIPE_SECRET_KEY)
const router=express.Router()

const baseUrl="https://food-backend-rdl7.vercel.app/api"



router.post('/create-checkout-session', userAuth, async (req, res, next) => {
    try {
        const { products } = req.body;
        
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ success: false, error: "No products provided" });
        }
        
        // Log the products for debugging
        console.log("Products received:", JSON.stringify(products, null, 2));
        
        const lineItems = products.map((item) => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item.dishName || item.name || "Food Item",
                    // Fix: Ensure description is never empty
                    description: item.description || "No description available",
                },
                unit_amount: Math.round((item.price || 0) * 100),  // Convert to cents/paisa
            },
            quantity: item.quantity || 1,
        }));
        
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${baseUrl}/payment/success`,
            cancel_url: `${baseUrl}/payment/cancel`,
        });
        
        res.json({ success: true, sessionId: session.id });
    } catch (error) {
        console.error("Payment session creation error:", error);
        res.status(error.statusCode || 500).json({ 
            success: false,
            error: error.message || "Internal server error" 
        });
    }
});












router.get('/transaction-details', userAuth, async (req, res) => {
    try {
        const { transaction_id, session_id } = req.query;
        
        if (!transaction_id && !session_id) {
            return res.status(400).json({ 
                success: false, 
                message: "Transaction ID or Session ID is required" 
            });
        }
        
        let transaction;
        
        if (transaction_id) {
            transaction = await Transaction.findById(transaction_id)
                .populate({
                    path: 'orderId',
                    select: 'items totalAmount status'
                });
        } else if (session_id) {
            transaction = await Transaction.findOne({ transactionId: session_id })
                .populate({
                    path: 'orderId',
                    select: 'items totalAmount status'
                });
                
            // If not found in our database, fetch from Stripe directly
            if (!transaction && session_id) {
                const session = await stripe.checkout.sessions.retrieve(session_id);
                
                if (!session) {
                    return res.status(404).json({
                        success: false,
                        message: "Transaction not found"
                    });
                }
                
                // Find the related order
                const order = await Order.findOne({ userId: req.user.id }).sort({ createdAt: -1 });
                
                // Return the Stripe session data
                return res.json({
                    success: true,
                    transaction: {
                        transactionId: session.id,
                        orderId: order ? order._id : 'Unknown',
                        amount: session.amount_total / 100,
                        status: session.payment_status,
                        createdAt: new Date(session.created * 1000)
                    }
                });
            }
        }
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found"
            });
        }
        
        // Return our database transaction
        return res.json({
            success: true,
            transaction: {
                _id: transaction._id,
                transactionId: transaction.transactionId,
                orderId: transaction.orderId,
                amount: transaction.amount,
                status: transaction.status,
                paymentMethod: transaction.paymentMethod,
                createdAt: transaction.createdAt
            }
        });
        
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to fetch transaction details" 
        });
    }
});

// Get all user transactions with pagination, filtering, and sorting
router.get('/transactions', userAuth, async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const sortBy = req.query.sortBy || 'date';
        const sortOrder = req.query.sortOrder || 'desc';
        const status = req.query.status;
        const dateRange = req.query.dateRange;
        const search = req.query.search;
        
        // Build query
        const query = { userId };
        
        // Add status filter if provided
        if (status && status !== 'all') {
            query.status = status;
        }
        
        // Add date range filter
        if (dateRange && dateRange !== 'all') {
            const now = new Date();
            let startDate;
            
            switch (dateRange) {
                case 'today':
                    startDate = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    // Start of week (Sunday)
                    startDate = new Date(now);
                    startDate.setDate(now.getDate() - now.getDay());
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'month':
                    // Start of month
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'year':
                    // Start of year
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
            }
            
            if (startDate) {
                query.createdAt = { $gte: startDate };
            }
        }
        
        // Add search filter if provided
        if (search) {
            // We'll search by transactionId or orderId
            // We need to handle the case where orderId is an ObjectId
            query.$or = [
                { transactionId: { $regex: search, $options: 'i' } },
            ];
            
            // Check if search could be a valid ObjectId
            if (/^[0-9a-fA-F]{24}$/.test(search)) {
                query.$or.push({ orderId: search });
            }
        }
        
        // Determine sort field and order
        let sortOptions = {};
        if (sortBy === 'date') {
            sortOptions.createdAt = sortOrder === 'asc' ? 1 : -1;
        } else if (sortBy === 'amount') {
            sortOptions.amount = sortOrder === 'asc' ? 1 : -1;
        }
        
        // Count total matching documents for pagination
        const total = await Transaction.countDocuments(query);
        
        // Execute query with pagination and sorting
        const transactions = await Transaction.find(query)
            .populate({
                path: 'orderId',
                select: '_id status items',
            })
            .sort(sortOptions)
            .skip(skip)
            .limit(limit);
        
        return res.json({
            success: true,
            transactions,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
        
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch transactions"
        });
    }
});


module.exports=router


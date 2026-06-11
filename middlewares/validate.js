module.exports = (validator) => {
    return async (req, res, next) => {
        console.log("reqBody ->>>>>",req.body)
        try {
            await validator.validate(req.body, {abortEarly: false});
           
        } catch (err) {
            console.log(err);
           const viewName = req.originalUrl.split("/").pop();
            return res.render(viewName, {
                messages: {
                    error: err.errors[0], 
                    redirect: null
                }, 
                values: req.body
            })
            //return res.status(400).json({errors: err.errors[0]})
            
        }
        next()
    }
}
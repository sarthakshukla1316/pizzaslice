const Menu = require('../../models/menu');

function homeController() {
    return {
        async index(req, res) {

            const foods = await Menu.find();
            // console.log(foods);
            return res.render('home', { foods: foods});
            
        },
        // async val(req, res) {

        //     return res.render('home', { foods: foods});
            
        // },
        // async filtered(req, res) {
        //     let foods = await Menu.find();

        //     foods = foods.filter(food => food.name.toLowerCase().includes(req.body.val.toLowerCase()));
        //     req.flash('foods', foods);
        //     return res.redirect('/val');
            
        // }
    }
}



module.exports = homeController
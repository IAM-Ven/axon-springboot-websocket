let stompClient = null
const foodOrderingServiceApiBaseUrl = "http://localhost:9082/api"

function connectToWebSocket() {
    const socket = new SockJS('/websocket')
    stompClient = Stomp.over(socket)

    stompClient.connect({},
        function (frame) {
            console.log('Connected: ' + frame)

            stompClient.subscribe('/topic/customer/added', function (event) {
                addCustomer(JSON.parse(event.body))
            })

            stompClient.subscribe('/topic/customer/updated', function (event) {
                updateCustomer(JSON.parse(event.body))
            })

            stompClient.subscribe('/topic/customer/deleted', function (event) {
                removeCustomer(JSON.parse(event.body))
            })

            stompClient.subscribe('/topic/restaurant/added', function (event) {
                addRestaurant(JSON.parse(event.body))
            })

            stompClient.subscribe('/topic/restaurant/updated', function (event) {
                updateRestaurant(JSON.parse(event.body))
            })

            stompClient.subscribe('/topic/restaurant/deleted', function (event) {
                removeRestaurant(JSON.parse(event.body))
            })

            stompClient.subscribe('/topic/restaurant/dish/added', function (event) {
                addRestaurantDish(JSON.parse(event.body))
            })

            stompClient.subscribe('/topic/restaurant/dish/updated', function (event) {
                updateRestaurantDish(JSON.parse(event.body))
            })

            stompClient.subscribe('/topic/restaurant/dish/deleted', function (event) {
                removeRestaurantDish(JSON.parse(event.body))
            })

            stompClient.subscribe('/topic/order/created', function (event) {
                addOrder(JSON.parse(event.body))
            })
        },
        function() {
            console.log('Unable to connect to Websocket!')
        }
    )
}

function loadCustomers() {
    $.ajax({
        url: foodOrderingServiceApiBaseUrl.concat("/customers"),
        contentType: "application/json",
        success: function(data, textStatus, jqXHR) {
            data.forEach(customer => {
                addCustomer(customer)
            })
        },
        error: function (jqXHR, textStatus, errorThrown) {}
    })
}

function loadRestaurants() {
    $.ajax({
        url: foodOrderingServiceApiBaseUrl.concat("/restaurants"),
        contentType: "application/json",
        success: function(data, textStatus, jqXHR) {
            data.forEach(restaurant => {
                addRestaurant(restaurant)
                restaurant.dishes.map(function(dish) {
                    return {restaurantId: restaurant.id, dishId: dish.id, dishName: dish.name, dishPrice: dish.price}
                })
                .map(dish => addRestaurantDish(dish))
            })
        },
        error: function (jqXHR, textStatus, errorThrown) {}
    })
}

function loadOrders() {
    $.ajax({
        url: foodOrderingServiceApiBaseUrl.concat("/orders"),
        contentType: "application/json",
        success: function(data, textStatus, jqXHR) {
            data.forEach(order => {
                addOrder(order)
            })
        },
        error: function (jqXHR, textStatus, errorThrown) {}
    })
}

function addOrder(order) {
    const items = order.items
        .map(item => item.quantity + "x " + item.dishName + " $" + item.dishPrice + " ($" + item.quantity*item.dishPrice + ")")
        .map(description => '<div class="item">' + description + '</div>')
        .join('')

    const row =
        '<tr>'+
            '<td>'+order.id+'</th>'+
            '<td><strong>'+order.customerName+'</strong></th>'+
            '<td>'+order.customerAddress+'</th>'+
            '<td><strong>'+order.restaurantName+'</strong></th>'+
            '<td>'+order.status+'</th>'+
            '<td>'+order.total+'</th>'+
            '<td>'+order.createdAt+'</th>'+
            '<td><div class="ui bulleted list">'+items+'</div></td>'+
        '</tr>'

    $('#orderTable').find('tbody').prepend(row)
}

function addCustomer(customer) {
    $('.ui.dropdown').find('div.menu').append('<div class="item" id="'+customer.id+'" data-value="'+customer.id+'">'+customer.name+'</div>')
}

function updateCustomer(customer) {
    $('#'+customer.id).text(customer.name)
}

function removeCustomer(customer) {
    $('#'+customer.id).remove()
}

function addRestaurant(restaurant) {
    const row =
        '<div id="'+restaurant.id+'_title" class="title">'+
            '<h3>'+restaurant.name+'</h3>'+
        '</div>'+
        '<div id="'+restaurant.id+'_content" class="content">'+
            '<table class="ui compact table">'+
                '<tbody></tbody>'+
                '<tfoot>'+
                    '<tr>'+
                        '<th class="one wide"></th>'+
                        '<th class="five wide"></th>'+
                        '<th class="three wide"></th>'+
                        '<th class="total four wide"></th>'+
                        '<th class="three wide">'+
                            '<button class="btnOrder ui teal fluid small button">Order</button>'+
                        '</th>'+
                    '</tr>'+
                '</tfoot>'+
            '</table>'+
        '</div>'
    $('.ui.accordion').prepend(row)
}

function updateRestaurant(restaurant) {
    $('#'+restaurant.id+'_title').find('h3').text(restaurant.name)
}

function removeRestaurant(restaurant) {
    $('#'+restaurant.id+'_title').remove()
    $('#'+restaurant.id+'_content').remove()
}

function getRestaurantDishRow(dish) {
    return (
        '<tr id="'+dish.dishId+'" class="dish">'+
            '<td class="ui center aligned">'+
                '<input type="checkbox">'+
            '</td>'+
            '<td class="name">'+dish.dishName+'</td>'+
            '<td class="price">'+dish.dishPrice+'</td>'+
            '<td>'+
                '<div class="ui small input">'+
                    '<input type="number" value="1" min="1" max="10">'+
                '</div>'+
            '</td>'+
            '<td></td>'+
        '</tr>'
    )
}

function addRestaurantDish(dish) {
    $('#'+dish.restaurantId+'_content').find('tbody').prepend(getRestaurantDishRow(dish))
}

function updateRestaurantDish(dish) {
    const $dish = $('#'+dish.dishId);
    $dish.find('td.name').text(dish.dishName)
    $dish.find('td.price').text(dish.dishPrice)
}

function removeRestaurantDish(dish) {
    $('#'+dish.dishId).remove()
}

function getOrderRequest($this) {
    const customerId = $(".dropdown").dropdown('get value')

    const $restaurantContent = $this.closest('.content')
    const restaurantContentId = $restaurantContent.attr('id')
    const restaurantId = restaurantContentId.substring(0, restaurantContentId.indexOf('_'))

    const items = []
    $restaurantContent.find('tr.dish').each(function(index, tr) {
        const dishChecked = $(tr).find('input[type="checkbox"]').prop('checked')
        if (dishChecked) {
            const dishId = $(tr).attr('id')
            const quantity = $(tr).find('input[type="number"]').val()
            items.push({dishId, quantity})
        }
    });

    return { customerId, restaurantId, items }
}

function validOrderRequest(orderRequest) {
    if (orderRequest.customerId.length === 0) {
        alert('Select the customer')
        return false
    }
    if (orderRequest.restaurantId.length === 0) {
        alert('Select the restaurant')
        return false
    }
    if (orderRequest.items.length === 0) {
        alert('Select a dish')
        return false
    }
    return true
}

$(function () {
    loadCustomers()
    loadRestaurants()
    loadOrders()

    connectToWebSocket()

    $('.menu .item').tab()
    $('.ui.dropdown').dropdown()
    $('.ui.accordion').accordion()

    $('.accordion').on('click', '.btnOrder', function() {
        const orderRequest = getOrderRequest($(this))
        if (validOrderRequest(orderRequest)) {
            $.ajax({
                type: 'POST',
                url: foodOrderingServiceApiBaseUrl.concat("/orders"),
                contentType: "application/json",
                data: JSON.stringify(orderRequest),
                success: function(data, textStatus, jqXHR) {
                    alert('Order submitted successfully. The order id is "' + data + '"')
                },
                error: function (jqXHR, textStatus, errorThrown) {}
            })
        }
    })
})


// code for total
//                $('.checkbox').checkbox({
//                    onChecked: function() {
//                        const price = parseFloat($(this).closest('tr').find('td.price').text())
//                        const $total = $(this).closest('table').find('tfoot').find('.total')
//                        const total = parseFloat($total.text())
//                        $total.text(total + price)
//                    },
//                    onUnchecked: function() {
//                        const price = parseFloat($(this).closest('tr').find('td.price').text())
//                        const $total = $(this).closest('table').find('tfoot').find('.total')
//                        const total = parseFloat($total.text())
//                        $total.text(total - price)
//                    }
//                })
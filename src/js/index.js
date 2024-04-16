let currentPage = 1;
let currentLimit = 1;
let currentOrder = 'asc';
let currentSort = 'id';

let defaultMode = 'add';

$(document).ready(async function() {
    console.log('Document is ready!');
    await getUserData();
});

$('#searchBtn').click(async function() {
    const searchQuery = $('#search').val();
    await getUserData(1, searchQuery); // Always reset to page 1 when searching
});

$('#prev').click(async function() {
    const searchQuery = $('#search').val();
    if (currentPage > 1) {
        await getUserData(currentPage - 1, searchQuery); // Update to previous page
    }
});

$('#next').click(async function() {
    const searchQuery = $('#search').val();
    await getUserData(currentPage + 1, searchQuery); // Update to next page
});

$('#limit').change(async function() {
    currentLimit = $(this).val();
    await getUserData(1, $('#search').val());
});

$('#order').change(async function() {
    currentOrder = $(this).val();
    await getUserData(1, $('#search').val());
});

$('#sort').change(async function() {
    currentSort = $(this).val();
    await getUserData(1, $('#search').val());
});

$('#save').click(function() {
    saveUser();
});

async function getUserData(page = 1, search = '') {
    currentPage = page;
    let userUrl = `http://localhost:3001/users?page=${page}&limit=${currentLimit}&order=${currentOrder}&sort=${currentSort}`;

    if (search) {
        userUrl += `&search=${search}`;
    }

    await $.ajax({
        url: userUrl,
        type: 'GET',
        success: function(response) {
            console.log(response);

            let users = response.rows;
            let total_page = response.total_pages;
            let page = `${response.page}/${total_page}`;

            let strHtml = "";
            
            users.forEach(element => {
                let { id, name, email, password } = element;

                strHtml += `<li class="list">
                    id: ${id}, name: ${name}, email: ${email}, password: ${password} 
                    <div>
                        <button id="edit-btn" onclick="editUser(${id})">edit</button>
                        <button id="delete-btn" onclick="deleteUser(${id})">delete</button>
                    </div>
                </li>`;
            });
            
            $('#users').html(strHtml);
            $('#page').html(page);

            if (currentPage == 1) {
                $('#prev').attr('disabled', true);
            } else {
                $('#prev').attr('disabled', false);
            }

            if (currentPage == total_page) {
                $('#next').attr('disabled', true);
            } else {
                $('#next').attr('disabled', false);
            }
        },
        error: function(error) {
            if (error.status === 404) {
                $('#users').html('No data found');
            }
        }
    });
}

async function getUserDataById(id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `http://localhost:3001/users/${id}`,
            type: 'GET',
            success: function(response) {
                console.log(response);
                resolve(response);
            },
            error: function(error) {
                console.log(error);
                reject(error);
            }
        });
    });
}

/*async function getUserDataById(id) {
    try {
        const response = await $.ajax({
            url: `http://localhost:3001/users/${id}`,
            type: 'GET'
        });
        console.log(response);
        return response;
    } catch (error) {
        console.log(error);
        throw error;
    }
}*/

async function editUser(id) {
    try {
        let response = await getUserDataById(id);
        let { name, email, password } = response;

        $('#id').val(id);
        $('#name').val(name);
        $('#email').val(email);
        $('#password').val(password);

        defaultMode = 'edit';
    } catch (error) {
        console.log(error);
    }
}

async function saveUser() {
    let name = $('#name').val();
    let email = $('#email').val();
    let password = $('#password').val();

    if (defaultMode === 'add') {
        $.ajax({
            url: 'http://localhost:3001/users',
            type: 'POST',
            data: { name, email, password },
            success: function() {
                getUserData(currentPage, $('#search').val());

                $('#name').val('');
                $('#email').val('');
                $('#password').val('');
            },
            error: function(error) {
                console.log(error);
            }
        });
    } else {
        let id = $('#id').val();

        $.ajax({
            url: `http://localhost:3001/users/${id}`,
            type: 'PUT',
            data: { name, email, password },
            success: function() {
                getUserData(currentPage, $('#search').val());

                $('#name').val('');
                $('#email').val('');
                $('#password').val('');

                defaultMode = 'add';
            },
            error: function(error) {
                console.log(error);
            }
        });
    }
}

async function deleteUser(id) {
    await $.ajax({
        url: `http://localhost:3001/users/${id}`,
        type: 'DELETE',
        success: function() {
            getUserData(1, $('#search').val());
        },
        error: function(error) {
            console.log(error);
        }
    });
}
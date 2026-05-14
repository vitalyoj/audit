// Глобальная переменная для токена
let authToken = null;

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================

function getHeaders() {
    return authToken ? {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    } : {
        'Content-Type': 'application/json'
    };
}

function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.target.classList.add('active');
}

// ==================== АУТЕНТИФИКАЦИЯ ====================

async function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
        authToken = data.access_token;
        document.getElementById('tokenStatus').innerHTML = `✅ Токен: ${authToken.substring(0, 60)}...`;
        alert('Вход выполнен!');
    } else {
        alert('Ошибка: ' + (data.message || 'Неверные учетные данные'));
    }
}

function clearToken() {
    authToken = null;
    document.getElementById('tokenStatus').innerHTML = '⚪ Токен не установлен';
}

async function getProfile() {
    const response = await fetch('http://localhost:3000/api/auth/profile', {
        headers: getHeaders()
    });
    const data = await response.json();
    alert(JSON.stringify(data, null, 2));
}

// ==================== ЗДАНИЯ ====================

async function getBuildings() {
    const response = await fetch('http://localhost:3000/api/buildings', {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('buildingsResult').innerHTML = JSON.stringify(data, null, 2);
}

async function createBuilding() {
    const name = document.getElementById('buildingName').value;
    const floorsCount = parseInt(document.getElementById('buildingFloors').value);
    
    const response = await fetch('http://localhost:3000/api/buildings', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, floorsCount })
    });
    const data = await response.json();
    document.getElementById('buildingsResult').innerHTML = JSON.stringify(data, null, 2);
    if (response.ok) getBuildings();
}

async function updateBuilding() {
    const id = document.getElementById('buildingId').value;
    const name = document.getElementById('editBuildingName').value;
    if (!id) { alert('Введите ID здания'); return; }
    
    const response = await fetch(`http://localhost:3000/api/buildings/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ name })
    });
    const data = await response.json();
    document.getElementById('buildingsResult').innerHTML = JSON.stringify(data, null, 2);
    if (response.ok) getBuildings();
}

async function deleteBuilding() {
    const id = document.getElementById('buildingId').value;
    if (!id) { alert('Введите ID здания'); return; }
    if (!confirm('Удалить здание со всеми этажами и аудиториями?')) return;
    
    const response = await fetch(`http://localhost:3000/api/buildings/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('buildingsResult').innerHTML = JSON.stringify(data, null, 2);
    if (response.ok) getBuildings();
}

async function getBuildingStats() {
    const response = await fetch('http://localhost:3000/api/rooms/statistics', {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('buildingsResult').innerHTML = JSON.stringify(data, null, 2);
}

// ==================== ЭТАЖИ ====================

async function getFloorsByBuilding() {
    const buildingId = document.getElementById('floorBuildingId').value;
    if (!buildingId) { alert('Введите ID здания'); return; }
    
    const response = await fetch(`http://localhost:3000/api/floors/building/${buildingId}`, {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('floorsResult').innerHTML = JSON.stringify(data, null, 2);
}

async function getFloorNumbers() {
    const buildingId = document.getElementById('floorBuildingId').value;
    if (!buildingId) { alert('Введите ID здания'); return; }
    
    const response = await fetch(`http://localhost:3000/api/floors/building/${buildingId}/numbers`, {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('floorsResult').innerHTML = JSON.stringify(data, null, 2);
}

async function getFloorById() {
    const id = document.getElementById('floorId').value;
    if (!id) { alert('Введите ID этажа'); return; }
    
    const response = await fetch(`http://localhost:3000/api/floors/${id}`, {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('floorsResult').innerHTML = JSON.stringify(data, null, 2);
}

async function updateFloor() {
    const id = document.getElementById('floorId').value;
    const name = document.getElementById('floorName').value;
    if (!id) { alert('Введите ID этажа'); return; }
    
    const response = await fetch(`http://localhost:3000/api/floors/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ name })
    });
    const data = await response.json();
    document.getElementById('floorsResult').innerHTML = JSON.stringify(data, null, 2);
}

// ==================== СХЕМЫ ЭТАЖЕЙ ====================

async function uploadSchema() {
    const floorId = document.getElementById('schemaFloorId').value;
    const file = document.getElementById('schemaFile').files[0];
    if (!floorId) { alert('Введите ID этажа'); return; }
    if (!file) { alert('Выберите файл'); return; }
    
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`http://localhost:3000/api/floor-schemas/upload/${floorId}`, {
        method: 'POST',
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
        body: formData
    });
    const data = await response.json();
    document.getElementById('floorsResult').innerHTML = JSON.stringify(data, null, 2);
}

async function getSchema() {
    const floorId = document.getElementById('schemaFloorId').value;
    if (!floorId) { alert('Введите ID этажа'); return; }
    
    const response = await fetch(`http://localhost:3000/api/floor-schemas/floor/${floorId}`, {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('floorsResult').innerHTML = JSON.stringify(data, null, 2);
}

async function deleteSchema() {
    const floorId = document.getElementById('schemaFloorId').value;
    if (!floorId) { alert('Введите ID этажа'); return; }
    if (!confirm('Удалить схему этажа?')) return;
    
    const response = await fetch(`http://localhost:3000/api/floor-schemas/floor/${floorId}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('floorsResult').innerHTML = JSON.stringify(data, null, 2);
}

// ==================== АУДИТОРИИ ====================

async function getRooms() {
    const response = await fetch('http://localhost:3000/api/rooms', {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('roomsResult').innerHTML = JSON.stringify(data, null, 2);
}

async function getRoomsFiltered() {
    const response = await fetch('http://localhost:3000/api/rooms?floor=3&capacityFrom=30', {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('roomsResult').innerHTML = JSON.stringify(data, null, 2);
}

async function getRoomPurposes() {
    const response = await fetch('http://localhost:3000/api/rooms/purposes', {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('roomsResult').innerHTML = JSON.stringify(data, null, 2);
}

async function getRoomStats() {
    const response = await fetch('http://localhost:3000/api/rooms/statistics', {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('roomsResult').innerHTML = JSON.stringify(data, null, 2);
}

async function createRoom() {
    const number = document.getElementById('roomNumber').value;
    const floorId = document.getElementById('roomFloorId').value;
    const purpose = document.getElementById('roomPurpose').value;
    const capacity = parseInt(document.getElementById('roomCapacity').value);
    const area = parseFloat(document.getElementById('roomArea').value);
    const description = document.getElementById('roomDesc').value;
    
    if (!number || !floorId) {
        alert('Заполните номер и ID этажа');
        return;
    }
    
    const response = await fetch('http://localhost:3000/api/rooms', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
            number, 
            floorId, 
            purpose, 
            capacity: isNaN(capacity) ? null : capacity,
            area: isNaN(area) ? null : area,
            description: description || null
        })
    });
    const data = await response.json();
    document.getElementById('roomsResult').innerHTML = JSON.stringify(data, null, 2);
    if (response.ok) {
        alert('Аудитория создана');
        getRooms();
    }
}

async function getRoomById() {
    const id = document.getElementById('roomSearchId').value;
    if (!id) {
        alert('Введите ID аудитории');
        return;
    }
    
    const response = await fetch(`http://localhost:3000/api/rooms/${id}`, {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('roomsResult').innerHTML = JSON.stringify(data, null, 2);
}

async function getRoomByNumber() {
    const number = document.getElementById('roomSearchNumber').value;
    if (!number) {
        alert('Введите номер аудитории');
        return;
    }
    
    const response = await fetch(`http://localhost:3000/api/rooms/number/${number}`, {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('roomsResult').innerHTML = JSON.stringify(data, null, 2);
}

async function deleteRoom() {
    const id = document.getElementById('roomSearchId').value;
    if (!id) {
        alert('Введите ID аудитории');
        return;
    }
    if (!confirm('Удалить аудиторию?')) return;
    
    const response = await fetch(`http://localhost:3000/api/rooms/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('roomsResult').innerHTML = JSON.stringify(data, null, 2);
    if (response.ok) {
        alert('Аудитория удалена');
        getRooms();
    }
}

// ==================== ПОЛНОЕ РЕДАКТИРОВАНИЕ ====================

let currentEditRoomId = null;
let currentFeatures = [];

async function loadRoomForEdit() {
    const id = document.getElementById('editRoomId').value;
    if (!id) {
        alert('Введите ID аудитории');
        return;
    }
    
    const response = await fetch(`http://localhost:3000/api/rooms/${id}`, {
        headers: getHeaders()
    });
    
    if (!response.ok) {
        alert('Аудитория не найдена');
        return;
    }
    
    const room = await response.json();
    currentEditRoomId = id;
    currentFeatures = room.features || [];
    
    document.getElementById('editNumber').value = room.number || '';
    document.getElementById('editFloor').value = room.floor?.floorNumber || room.floorId || 'Неизвестно';
    document.getElementById('editPurpose').value = room.purpose || '';
    document.getElementById('editCapacity').value = room.capacity || '';
    document.getElementById('editArea').value = room.area || '';
    document.getElementById('editDescription').value = room.description || '';
    
    updateFeaturesPreview();
    await loadEditMedia(room.id);
    
    document.getElementById('editRoomForm').style.display = 'block';
}

function updateFeaturesPreview() {
    const preview = document.getElementById('editFeaturesPreview');
    if (!currentFeatures.length) {
        preview.innerHTML = 'Нет данных';
        return;
    }
    preview.innerHTML = currentFeatures.map(f => 
        `${f.featureName}: ${f.featureValue || ''} (кол-во: ${f.quantity || 1})${f.technicalSpecs ? ` [${f.technicalSpecs}]` : ''}`
    ).join('\n');
}

function openFeaturesModal() {
    const container = document.getElementById('featuresList');
    container.innerHTML = '';
    
    if (currentFeatures.length === 0) {
        addFeatureRow();
    } else {
        currentFeatures.forEach((feature, index) => {
            addFeatureRow(index, feature);
        });
    }
    
    document.getElementById('featuresModal').style.display = 'block';
}

function addFeatureRow(index = null, feature = null) {
    const container = document.getElementById('featuresList');
    const rowId = Date.now() + Math.random();
    const rowDiv = document.createElement('div');
    rowDiv.className = 'flex-row';
    rowDiv.style.marginBottom = '10px';
    rowDiv.style.borderBottom = '1px solid #eee';
    rowDiv.style.padding = '5px';
    rowDiv.id = `feature-row-${rowId}`;
    
    const featureName = feature?.featureName || '';
    const featureValue = feature?.featureValue || '';
    const quantity = feature?.quantity || 1;
    const technicalSpecs = feature?.technicalSpecs || '';
    
    rowDiv.innerHTML = `
        <input type="text" placeholder="Название" value="${featureName}" style="width: 120px;" class="feature-name">
        <input type="text" placeholder="Значение" value="${featureValue}" style="width: 120px;" class="feature-value">
        <input type="number" placeholder="Кол-во" value="${quantity}" style="width: 60px;" class="feature-quantity">
        <input type="text" placeholder="Тех. характеристики" value="${technicalSpecs}" style="width: 200px;" class="feature-specs">
        <button onclick="removeFeatureRow('${rowId}')" style="background: #dc3545; color: white; padding: 2px 8px;">🗑️</button>
    `;
    
    container.appendChild(rowDiv);
}

function removeFeatureRow(rowId) {
    const row = document.getElementById(`feature-row-${rowId}`);
    if (row) row.remove();
}

function saveFeatures() {
    const rows = document.querySelectorAll('#featuresList .flex-row');
    const newFeatures = [];
    
    rows.forEach(row => {
        const name = row.querySelector('.feature-name')?.value;
        const value = row.querySelector('.feature-value')?.value;
        const quantity = parseInt(row.querySelector('.feature-quantity')?.value) || 1;
        const specs = row.querySelector('.feature-specs')?.value;
        
        if (name && name.trim()) {
            newFeatures.push({
                featureName: name.trim(),
                featureValue: value || null,
                quantity: quantity,
                technicalSpecs: specs || null
            });
        }
    });
    
    currentFeatures = newFeatures;
    updateFeaturesPreview();
    closeFeaturesModal();
}

function closeFeaturesModal() {
    document.getElementById('featuresModal').style.display = 'none';
}



async function loadEditMedia(roomId) {
    const container = document.getElementById('editMediaPreview');
    container.innerHTML = '<span>Загрузка...</span>';
    
    try {
        const response = await fetch(`http://localhost:3000/api/room-media/room/${roomId}`, {
            headers: getHeaders()
        });
        const media = await response.json();
        
        if (!media.length) {
            container.innerHTML = '<span>Нет медиафайлов</span>';
            return;
        }
        
        container.innerHTML = '';
        media.forEach(m => {
            const div = document.createElement('div');
            div.style.position = 'relative';
            div.style.width = '100px';
            div.style.height = '100px';
            div.style.border = '1px solid #ccc';
            div.style.borderRadius = '4px';
            div.style.overflow = 'hidden';
            const BACKEND_URL = 'http://localhost:3000';
            div.innerHTML = `
                <img src="${BACKEND_URL}${m.url}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.src='https://via.placeholder.com/100?text=No+image'">
                <button onclick="deleteEditMedia('${m.id}')" style="position: absolute; top: 2px; right: 2px; background: red; color: white; border: none; border-radius: 50%; width: 20px; height: 20px; cursor: pointer; font-size: 12px;">×</button>
                <div style="font-size: 10px; text-align: center;">${m.mediaType === 'panorama' ? '🌍 Панорама' : '📷 Фото'}</div>
            `;
            container.appendChild(div);
        });
    } catch (error) {
        container.innerHTML = '<span>Ошибка загрузки медиа</span>';
    }
}

async function uploadEditMedia() {
    const file = document.getElementById('editMediaFile').files[0];
    const mediaType = document.getElementById('editMediaType').value;
    const roomId = currentEditRoomId;
    
    if (!roomId) {
        alert('Нет выбранной аудитории');
        return;
    }
    if (!file) {
        alert('Выберите файл');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    const endpoint = mediaType === 'photo' 
        ? `http://localhost:3000/api/room-media/upload/photo/${roomId}`
        : `http://localhost:3000/api/room-media/upload/panorama/${roomId}`;
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
        body: formData
    });
    
    if (response.ok) {
        alert('Файл загружен');
        loadEditMedia(roomId);
        document.getElementById('editMediaFile').value = '';
    } else {
        const error = await response.json();
        alert('Ошибка: ' + (error.message || 'Неизвестная ошибка'));
    }
}

async function deleteEditMedia(mediaId) {
    if (!confirm('Удалить файл?')) return;
    
    const response = await fetch(`http://localhost:3000/api/room-media/${mediaId}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    
    if (response.ok) {
        alert('Файл удален');
        loadEditMedia(currentEditRoomId);
    } else {
        alert('Ошибка удаления');
    }
}

async function saveRoomEdit() {
    const id = currentEditRoomId;
    const number = document.getElementById('editNumber').value;
    const purpose = document.getElementById('editPurpose').value;
    const capacity = parseInt(document.getElementById('editCapacity').value);
    const area = parseFloat(document.getElementById('editArea').value);
    const description = document.getElementById('editDescription').value;
    
    if (!number) {
        alert('Номер аудитории обязателен');
        return;
    }
    
    const updateData = {
        number,
        purpose,
        capacity: isNaN(capacity) ? null : capacity,
        area: isNaN(area) ? null : area,
        description: description || null,
        features: currentFeatures
    };
    
    const response = await fetch(`http://localhost:3000/api/rooms/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(updateData)
    });
    
    if (response.ok) {
        alert('Аудитория обновлена');
        closeEditForm();
        getRooms();
    } else {
        const error = await response.json();
        alert('Ошибка: ' + (error.message || 'Неизвестная ошибка'));
    }
}

function closeEditForm() {
    document.getElementById('editRoomForm').style.display = 'none';
    currentEditRoomId = null;
    currentFeatures = [];
    document.getElementById('editRoomId').value = '';
    document.getElementById('editMediaPreview').innerHTML = '';
}

// ==================== РАСШИРЕННЫЙ ПОИСК ====================

async function advancedSearch() {
    const search = document.getElementById('searchQuery').value;
    const floorId = document.getElementById('filterFloorId').value;
    const purpose = document.getElementById('filterPurpose').value;
    const capacityFrom = document.getElementById('filterCapacityFrom').value;
    const capacityTo = document.getElementById('filterCapacityTo').value;
    const features = document.getElementById('filterFeatures').value;
    
    let url = 'http://localhost:3000/api/rooms?';
    const params = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (floorId) params.push(`floorId=${floorId}`);
    if (purpose) params.push(`purposes=${encodeURIComponent(purpose)}`);
    if (capacityFrom) params.push(`capacityFrom=${capacityFrom}`);
    if (capacityTo) params.push(`capacityTo=${capacityTo}`);
    if (features) params.push(`features=${encodeURIComponent(features)}`);
    
    url += params.join('&');
    
    const response = await fetch(url, { headers: getHeaders() });
    const data = await response.json();
    document.getElementById('roomsResult').innerHTML = JSON.stringify(data, null, 2);
}

function clearFilters() {
    document.getElementById('searchQuery').value = '';
    document.getElementById('filterFloorId').value = '';
    document.getElementById('filterPurpose').value = '';
    document.getElementById('filterCapacityFrom').value = '';
    document.getElementById('filterCapacityTo').value = '';
    document.getElementById('filterFeatures').value = '';
    getRooms();
}
// ==================== ОСНАЩЕНИЕ ====================

async function getRoomById() {
    const id = document.getElementById('roomSearchId').value;
    if (!id) {
        alert('Введите ID аудитории');
        return;
    }
    
    const response = await fetch(`http://localhost:3000/api/rooms/${id}`, {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('roomsResult').innerHTML = JSON.stringify(data, null, 2);
}
async function getFeaturesByRoom() {
    const roomId = document.getElementById('featureRoomId').value;
    if (!roomId) { alert('Введите ID аудитории'); return; }
    
    const response = await fetch(`http://localhost:3000/api/room-features/room/${roomId}`, {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('featuresResult').innerHTML = JSON.stringify(data, null, 2);
}

async function createFeature() {
    const roomId = document.getElementById('featureRoomId').value;
    const featureName = document.getElementById('featureName').value;
    const featureValue = document.getElementById('featureValue').value;
    const quantity = parseInt(document.getElementById('featureQuantity').value);
    const technicalSpecs = document.getElementById('featureSpecs').value;
    
    const response = await fetch('http://localhost:3000/api/room-features', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ roomId, featureName, featureValue, quantity, technicalSpecs })
    });
    const data = await response.json();
    document.getElementById('featuresResult').innerHTML = JSON.stringify(data, null, 2);
    if (response.ok) getFeaturesByRoom();
}

async function deleteFeature() {
    const id = document.getElementById('featureId').value;
    if (!id) { alert('Введите ID оснащения'); return; }
    
    const response = await fetch(`http://localhost:3000/api/room-features/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('featuresResult').innerHTML = JSON.stringify(data, null, 2);
    if (response.ok) getFeaturesByRoom();
}

// ==================== МЕДИА ====================

async function uploadMedia() {
    const roomId = document.getElementById('mediaRoomId').value;
    const mediaType = document.getElementById('mediaType').value;
    const file = document.getElementById('mediaFile').files[0];
    if (!roomId) { alert('Введите ID аудитории'); return; }
    if (!file) { alert('Выберите файл'); return; }
    
    const formData = new FormData();
    formData.append('file', file);
    
    const endpoint = mediaType === 'photo' 
        ? `http://localhost:3000/api/room-media/upload/photo/${roomId}`
        : `http://localhost:3000/api/room-media/upload/panorama/${roomId}`;
    
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {},
        body: formData
    });
    const data = await response.json();
    document.getElementById('mediaResult').innerHTML = JSON.stringify(data, null, 2);
}

async function getMediaByRoom() {
    const roomId = document.getElementById('mediaRoomId').value;
    if (!roomId) { alert('Введите ID аудитории'); return; }
    
    const response = await fetch(`http://localhost:3000/api/room-media/room/${roomId}`, {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('mediaResult').innerHTML = JSON.stringify(data, null, 2);
}

async function getPanorama() {
    const roomId = document.getElementById('mediaRoomId').value;
    if (!roomId) { alert('Введите ID аудитории'); return; }
    
    const response = await fetch(`http://localhost:3000/api/room-media/room/${roomId}/panorama`, {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('mediaResult').innerHTML = JSON.stringify(data, null, 2);
}

async function getPhotos() {
    const roomId = document.getElementById('mediaRoomId').value;
    if (!roomId) { alert('Введите ID аудитории'); return; }
    
    const response = await fetch(`http://localhost:3000/api/room-media/room/${roomId}/photos`, {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('mediaResult').innerHTML = JSON.stringify(data, null, 2);
}

async function deleteMedia() {
    const id = document.getElementById('mediaId').value;
    if (!id) { alert('Введите ID медиа'); return; }
    
    const response = await fetch(`http://localhost:3000/api/room-media/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('mediaResult').innerHTML = JSON.stringify(data, null, 2);
}

// ==================== ЗАЯВКИ ====================
/**
 * Получить все заявки с фильтрацией
 */
async function getAllTickets() {
    const buildingId = document.getElementById('filterBuildingId')?.value || '';
    const statuses = document.getElementById('filterStatuses')?.value || '';
    
    let url = 'http://localhost:3000/api/tickets';
    const params = [];
    if (buildingId) params.push(`buildingId=${buildingId}`);
    if (statuses) params.push(`statuses=${statuses}`);
    if (params.length) url += '?' + params.join('&');
    
    const response = await fetch(url, {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('ticketsResult').innerHTML = JSON.stringify(data, null, 2);
}

/**
 * Получить мои заявки (назначенные на текущего пользователя)
 */
async function getMyTickets() {
    const response = await fetch('http://localhost:3000/api/tickets/my', {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('ticketsResult').innerHTML = JSON.stringify(data, null, 2);
}

/**
 * Получить заявки по аудитории (с разделением на активные и архив)
 */
async function getTicketsByRoom() {
    const roomId = document.getElementById('ticketsRoomId').value;
    if (!roomId) {
        alert('Введите ID аудитории');
        return;
    }
    
    const response = await fetch(`http://localhost:3000/api/tickets/room/${roomId}`, {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('ticketsResult').innerHTML = JSON.stringify(data, null, 2);
}

/**
 * Получить список аудиторий с активными заявками (для индикатора на плане)
 */
async function getRoomsWithActiveTickets() {
    const response = await fetch('http://localhost:3000/api/tickets/rooms-with-active', {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('ticketsResult').innerHTML = JSON.stringify(data, null, 2);
}

/**
 * Подача заявки из внешней формы (без авторизации)
 */
async function createTicketExternal() {
    const roomNumber = document.getElementById('ticketRoomNumber').value;
    const description = document.getElementById('ticketDescription').value;
    const reporterEmail = document.getElementById('ticketEmail').value;
    
    if (!roomNumber || !description || !reporterEmail) {
        alert('Заполните все поля');
        return;
    }
    
    const response = await fetch('http://localhost:3000/api/tickets/external', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomNumber, description, reporterEmail })
    });
    const data = await response.json();
    document.getElementById('ticketsResult').innerHTML = JSON.stringify(data, null, 2);
    
    if (response.ok) {
        alert(`✅ Заявка №${data.id} успешно создана!`);
    } else {
        alert(`❌ Ошибка: ${data.message}`);
    }
}

/**
 * Получить заявку по ID
 */
async function getTicketById() {
    const id = document.getElementById('ticketId').value;
    if (!id) {
        alert('Введите ID заявки');
        return;
    }
    
    const response = await fetch(`http://localhost:3000/api/tickets/${id}`, {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('ticketsResult').innerHTML = JSON.stringify(data, null, 2);
}

/**
 * Назначить исполнителя на заявку
 */
async function assignTicket() {
    const id = document.getElementById('ticketId').value;
    const userId = document.getElementById('assignUserId').value;
    if (!id || !userId) {
        alert('Введите ID заявки и ID исполнителя');
        return;
    }
    
    const response = await fetch(`http://localhost:3000/api/tickets/${id}/assign`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ userId })
    });
    const data = await response.json();
    document.getElementById('ticketsResult').innerHTML = JSON.stringify(data, null, 2);
    
    if (response.ok) {
        alert(`✅ Исполнитель назначен на заявку №${id}`);
    }
}

/**
 * Взять заявку в работу (только для исполнителя)
 */
async function takeTicket() {
    const id = document.getElementById('ticketId').value;
    if (!id) {
        alert('Введите ID заявки');
        return;
    }
    
    const response = await fetch(`http://localhost:3000/api/tickets/${id}/take`, {
        method: 'PATCH',
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('ticketsResult').innerHTML = JSON.stringify(data, null, 2);
    
    if (response.ok) {
        alert(`✅ Заявка №${id} взята в работу`);
    }
}

/**
 * Закрыть заявку
 */
async function closeTicket() {
    const id = document.getElementById('ticketId').value;
    if (!id) {
        alert('Введите ID заявки');
        return;
    }
    
    const response = await fetch(`http://localhost:3000/api/tickets/${id}/close`, {
        method: 'PATCH',
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('ticketsResult').innerHTML = JSON.stringify(data, null, 2);
    
    if (response.ok) {
        alert(`✅ Заявка №${id} закрыта`);
    }
}

/**
 * Обновить статус заявки
 */
async function updateTicketStatus() {
    const id = document.getElementById('ticketId').value;
    const status = document.getElementById('ticketStatus').value;
    if (!id) {
        alert('Введите ID заявки');
        return;
    }
    
    const response = await fetch(`http://localhost:3000/api/tickets/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status })
    });
    const data = await response.json();
    document.getElementById('ticketsResult').innerHTML = JSON.stringify(data, null, 2);
}

/**
 * Получить статистику по заявкам
 */
async function getTicketStats() {
    const buildingId = document.getElementById('statsBuildingId')?.value || '';
    let url = 'http://localhost:3000/api/tickets/statistics';
    if (buildingId) url += `?buildingId=${buildingId}`;
    
    const response = await fetch(url, {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('ticketsResult').innerHTML = JSON.stringify(data, null, 2);
}

/**
 * Ручной запуск опроса Яндекс Форм (только суперадмин)
 */
async function manualPoll() {
    const response = await fetch('http://localhost:3000/api/tickets/poll-manual', {
        method: 'POST',
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('ticketsResult').innerHTML = JSON.stringify(data, null, 2);
    alert(`Опрос выполнен: обработано ${data.processed}, создано ${data.created}, ошибок ${data.errors}`);
}

/**
 * Сброс счетчика последней проверки (только суперадмин)
 */
async function resetPollCounter() {
    const response = await fetch('http://localhost:3000/api/tickets/poll-reset', {
        method: 'POST',
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('ticketsResult').innerHTML = JSON.stringify(data, null, 2);
    alert('Счетчик последней проверки сброшен');
}

/**
 * Получить статус последней проверки
 */
async function getPollStatus() {
    const response = await fetch('http://localhost:3000/api/tickets/poll-status', {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('ticketsResult').innerHTML = JSON.stringify(data, null, 2);
}

/**
 * Тест подключения к API Яндекс Форм
 */
async function testYandexApi() {
    const response = await fetch('http://localhost:3000/api/tickets/test-yandex-api', {
        method: 'POST',
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('ticketsResult').innerHTML = JSON.stringify(data, null, 2);
    
    if (data.success) {
        alert('✅ Подключение к API Яндекс Форм успешно');
    } else {
        alert(`❌ Ошибка: ${data.message}`);
    }
}

// ==================== ПОЛЬЗОВАТЕЛИ ====================

async function getAllUsers() {
    const response = await fetch('http://localhost:3000/api/users', {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('usersResult').innerHTML = JSON.stringify(data, null, 2);
}

async function searchLdap() {
    const query = document.getElementById('ldapSearchQuery').value;
    const response = await fetch(`http://localhost:3000/api/users/ldap/search?q=${encodeURIComponent(query)}`, {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('usersResult').innerHTML = JSON.stringify(data, null, 2);
}

async function addUser() {
    const email = document.getElementById('newUserEmail').value;
    const fullName = document.getElementById('newUserFullName').value;
    const role = document.getElementById('newUserRole').value;
    
    const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, fullName, role })
    });
    const data = await response.json();
    document.getElementById('usersResult').innerHTML = JSON.stringify(data, null, 2);
    if (response.ok) getAllUsers();
}

async function updateUserRole() {
    const id = document.getElementById('userId').value;
    const role = document.getElementById('updateRole').value;
    if (!id) { alert('Введите ID пользователя'); return; }
    
    const response = await fetch(`http://localhost:3000/api/users/${id}/role`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ role })
    });
    const data = await response.json();
    document.getElementById('usersResult').innerHTML = JSON.stringify(data, null, 2);
}

async function deleteUser() {
    const id = document.getElementById('userId').value;
    if (!id) { alert('Введите ID пользователя'); return; }
    if (!confirm('Удалить пользователя?')) return;
    
    const response = await fetch(`http://localhost:3000/api/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('usersResult').innerHTML = JSON.stringify(data, null, 2);
    if (response.ok) getAllUsers();
}

// ==================== ЛОГИ ====================

async function getAllLogs() {
    const response = await fetch('http://localhost:3000/api/logs', {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('logsResult').innerHTML = JSON.stringify(data, null, 2);
}

async function getLogsByUser() {
    const userId = document.getElementById('logUserId').value;
    if (!userId) { alert('Введите ID пользователя'); return; }
    
    const response = await fetch(`http://localhost:3000/api/logs/user/${userId}`, {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('logsResult').innerHTML = JSON.stringify(data, null, 2);
}

async function getLogsByTarget() {
    const targetId = document.getElementById('logTargetId').value;
    const targetType = document.getElementById('logTargetType').value;
    if (!targetId || !targetType) { alert('Введите ID и тип объекта'); return; }
    
    const response = await fetch(`http://localhost:3000/api/logs/target/${targetId}/${targetType}`, {
        headers: getHeaders()
    });
    const data = await response.json();
    document.getElementById('logsResult').innerHTML = JSON.stringify(data, null, 2);
}
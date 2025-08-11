<script setup lang="ts">
    import Button from './elements/Button.vue';
    const test = () => {
        console.log("test")
    }
</script>

<template>
    <div class="border border-white text-white">
        <h3>Фильтры</h3>
        <h4>Название задачи</h4>
        <input />
        <h4>Статус</h4>
        <select>
            <option>Запланировано</option>
            <option>В работе</option>
            <option>Готово</option>
        </select>
        <h4>Теги</h4>
        <input />

        <button>Очистить фильтры</button>
        <Button 
            title="Name button"
            :func="test"
            classes="border border-black ml-[20px]"
        />
    </div>
</template>
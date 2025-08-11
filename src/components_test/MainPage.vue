<script setup lang="ts">
    import TaskArea from './TaskArea.vue'
    import Header from './Header.vue';
    import FilterMenu from './FilterMenu.vue';


</script>

<template>
    <div class="flex flex-col h-screen">
        <header class="w-full h-16 bg-gray-800 text-white fixed top-0 left-0 z-50 flex items-center px-4">
            <Header />
        </header>
        <!-- Основная область с отступом сверху, равным высоте header -->
        <div class="flex flex-1 pt-16">
            <!-- Фильтр меню фиксированной ширины и фиксированное позиционирование -->
            <aside class="w-64 bg-gray-500 h-screen fixed top-16 left-0">
                <FilterMenu />
            </aside>
            <!-- TaskArea занимает остальную ширину и может прокручиваться -->
            <main class="flex-1 overflow-auto p-4 ml-64">
                <TaskArea />
            </main>
        </div>
    </div>


</template>
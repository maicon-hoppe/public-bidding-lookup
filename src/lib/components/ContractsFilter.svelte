<script lang="ts">
    import { onMount } from "svelte";
    import type { FilterOptions } from "$lib/types";

    const { filters = $bindable() }: { filters: FilterOptions } = $props();

    let searchConfigButtonChecked = $state(true);
    let searchConfigMenu: HTMLMenuElement;

    let filterMenuButton: HTMLLabelElement;
    let filterButtonChecked = $state(false);
    let filterOptionsMenu: HTMLMenuElement;

    onMount(() => {
        const handleClick = function (event: PointerEvent) {
            if (!filterOptionsMenu.contains(event.target as HTMLElement)) {
                if (filterMenuButton.contains(event.target as HTMLElement)) {
                    filterOptionsMenu.style.display = filterButtonChecked
                        ? "none"
                        : "flex";
                } else {
                    filterButtonChecked = false;
                    filterOptionsMenu.style.display = "none";
                }
            }
        };

        const handleKey = function (event: KeyboardEvent) {
            if (event.key === "Escape") {
                filterButtonChecked = false;
                filterOptionsMenu.style.display = "none";
            }
        };

        document.body.addEventListener("click", handleClick);
        document.body.addEventListener("keydown", handleKey);

        return () => {
            document.body.removeEventListener("click", handleClick);
            document.body.removeEventListener("keydown", handleKey);
        };
    });
</script>

<search>
    <div>
        <div id="search-box">
            <input
                type="text"
                id="search-input"
                placeholder="Pesquisar..."
                bind:value={filters.textSearch.text}
            />
            <label for="config-search">
                <input
                    type="checkbox"
                    id="config-search"
                    aria-label="Abir configuração de pesquisa"
                    bind:checked={searchConfigButtonChecked}
                    onclick={() => {
                        searchConfigMenu.style.display =
                            searchConfigButtonChecked ? "flex" : "none";
                    }}
                />
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 -960 960 960"
                >
                    <path
                        d="m370-80-16-128q-13-5-24.5-12T307-235l-119 50L78-375l103-78q-1-7-1-13.5v-27q0-6.5 1-13.5L78-585l110-190 119 50q11-8 23-15t24-12l16-128h220l16 128q13 5 24.5 12t22.5 15l119-50 110 190-103 78q1 7 1 13.5v27q0 6.5-2 13.5l103 78-110 190-118-50q-11 8-23 15t-24 12L590-80H370Zm112-260q58 0 99-41t41-99q0-58-41-99t-99-41q-59 0-99.5 41T342-480q0 58 40.5 99t99.5 41Z"
                    />
                </svg>
            </label>
        </div>

        <button
            id="submit-search-button"
            class="secondary-button"
            aria-label="Pesquisar"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
                <path
                    d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"
                />
            </svg>
        </button>
        <menu
            id="search-config"
            aria-labelledby="config-button"
            bind:this={searchConfigMenu}
        >
            {#each filters.textSearch.textOptions as option}
                <li>
                    <input
                        type="radio"
                        name="search-text"
                        id={option.toLowerCase()}
                        checked={option === filters.textSearch.selected}
                        value={option}
                        bind:group={filters.textSearch.selected}
                    />
                    <label for={option.toLowerCase()}>{option}</label>
                </li>
            {/each}
        </menu>
    </div>

    <label
        for="filter-search"
        class="secondary-button"
        bind:this={filterMenuButton}
    >
        <input
            type="checkbox"
            id="filter-search"
            aria-label="Opções de filtragem"
            bind:checked={filterButtonChecked}
            onclick={() => {
                filterOptionsMenu.style.display = filterButtonChecked
                    ? "none"
                    : "flex";
            }}
        />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960">
            {#if filterButtonChecked}
                <path
                    d="M400-240v-80h160v80H400ZM240-440v-80h480v80H240ZM120-640v-80h720v80H120Z"
                />
            {:else}
                <path
                    d="M791-55 55-791l57-57 736 736-57 57ZM633-440l-80-80h167v80h-87ZM433-640l-80-80h487v80H433Zm-33 400v-80h160v80H400ZM240-440v-80h166v80H240ZM120-640v-80h86v80h-86Z"
                />
            {/if}
        </svg>
    </label>
    <menu
        id="filter-options"
        aria-labelledby="filter-button"
        bind:this={filterOptionsMenu}
    >
        {#each filters.filterSearch as option}
            <li>
                <details>
                    <summary>{option.title}</summary>
                    <ul>
                        {#if option.type === "date"}
                            {#each option.choices as choice}
                                <li>
                                    <label>
                                        <span>{choice}:</span>
                                        <input
                                            type={option.type}
                                            id={choice
                                                .replace(" ", "_")
                                                .replace("ê", "e")
                                                .toLowerCase()}
                                            bind:value={
                                                option.selected[
                                                    option.choices.indexOf(
                                                        choice,
                                                    )
                                                ]
                                            }
                                        />
                                    </label>
                                </li>
                            {/each}
                        {:else if option.type === "checkbox"}
                            {#each option.choices as choice}
                                <li>
                                    <label>
                                        <input
                                            type="checkbox"
                                            value={choice}
                                            bind:group={option.selected}
                                        />
                                        {choice}
                                    </label>
                                </li>
                            {/each}
                        {/if}
                    </ul>
                </details>
            </li>
        {/each}
    </menu>
</search>

<style>
    search {
        display: flex;
        height: 32px;

        gap: 5px;
        z-index: 9;
        background-color: var(--background);

        * {
            font-size: var(--text-size);
        }

        input[type="checkbox"] {
            display: none;
            cursor: pointer;
        }

        & > div {
            display: inline-flex;
            height: inherit;
            width: 100%;

            flex-flow: row nowrap;
            align-items: stretch;

            #search-box {
                display: inline-flex;
                flex-flow: row nowrap;
                align-items: center;
                padding: 5px;

                border: 1px solid var(--background-10);
                border-right: none;
                border-top-left-radius: var(--default-bradius);
                border-bottom-left-radius: var(--default-bradius);
                background-color: var(--background-10);

                &:hover {
                    border: 1px solid var(--text-color);
                    border-right: none;

                    & + #submit-search-button {
                        border-left: 2px solid var(--text-color);
                    }
                }

                &:focus-within {
                    border: 2px outset var(--text-color);
                    border-right: none;

                    & + #submit-search-button {
                        border-left: 2px inset var(--text-color);
                    }
                }

                &,
                #search-input {
                    width: 100%;
                }

                #search-input {
                    padding: 5px;
                    border: none;
                    background-color: transparent;

                    &:focus-visible {
                        outline: none;
                    }
                }

                label[for="config-search"] {
                    cursor: pointer;
                    user-select: none;

                    &:has(input:checked) svg {
                        transform: rotate(90deg);
                    }
                    svg {
                        height: 20px;
                        width: 20px;
                    }
                }
            }

            #submit-search-button {
                padding: 0px 8px;
                border-top-left-radius: 0px;
                border-bottom-left-radius: 0px;
            }

            menu#search-config {
                display: none;
                flex-flow: column nowrap;
                padding: 5px 8px;

                position: absolute;
                top: 105%;
                right: 10%;

                list-style: inside none;

                border: 1px solid var(--text-color);
                border-radius: var(--default-bradius);
                background-color: var(--background-20);
            }
        }

        & > label[for="filter-search"] {
            padding: 0px 3px;
            margin-right: 5px;
        }

        & > menu#filter-options {
            display: none;
            flex-flow: column nowrap;
            align-items: stretch;

            position: absolute;
            right: 0%;

            border: 1px solid var(--text-color);
            border-radius: var(--default-bradius);
            background-color: var(--background-20);

            list-style: inside none;

            input[type="checkbox"] {
                display: inline-block;
            }

            & > li > details > summary {
                padding: var(--heading-space);
                font-weight: bold;

                user-select: none;
                box-shadow: 0px 0px 2px black;
            }

            & > li > details > ul {
                padding: 8px;
                list-style: none;

                li {
                    padding: 3px 2px;

                    label:where(
                            :has(input#vigencia_inicial),
                            :has(input#vigencia_final)
                        ) {
                        display: flex;
                        flex-flow: row nowrap;
                        align-items: baseline;
                        justify-content: space-between;

                        input#vigencia_inicial,
                        input#vigencia_final {
                            padding: 4px;
                            border: 1px solid var(--background-10);
                            background-color: var(--background-10);

                            cursor: pointer;

                            &:focus-visible {
                                border: 1px solid var(--text-color);
                                outline: none;
                            }
                        }
                    }
                }
            }
        }
    }

    svg {
        height: 24px;
        width: 24px;
        fill: var(--text-color);
    }

    @media (769px <= width <= 1440px) {
        search > menu#filter-options {
            top: 14%;
        }
    }

    @media (481px <= width <= 768px) {
        search {
            width: 100%;
            position: sticky;
            top: 0px;

            & > menu#filter-options {
                min-width: 311px;
                top: 105%;
            }
        }
    }
</style>

<?php

// tests/Feature/PestTest.php

it('souvre avec succès', function () {
    $this->get('/')->assertStatus(200);
});

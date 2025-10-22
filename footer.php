</div>

    <footer id="colophon" class="site-footer">
        <div class="site-info">
            <a href="<?php echo esc_url(__('https://wordpress.org/', 'cal-ai-inspired')); ?>">
                <?php
                printf(esc_html__('Proudly powered by %s', 'cal-ai-inspired'), 'WordPress');
                ?>
            </a>
            <span class="sep"> | </span>
            <?php
            printf(esc_html__('Theme: %1$s by %2$s', 'cal-ai-inspired'), 'Cal AI Inspired', '<a href="https://example.com">AI Assistant</a>');
            ?>
        </div>
    </footer>
</div>

<?php wp_footer(); ?>
</body>
</html>
package com.aspira.backend.scheduler;

import com.aspira.backend.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RankingScheduler {

    private final PostService postService;

    // Recalculate rank scores every hour
    @Scheduled(cron = "0 0 * * * *") // Runs at the start of every hour
    public void updateRankScores() {
        postService.updateRankScores();
        System.out.println("Rank scores updated!");
    }
}
